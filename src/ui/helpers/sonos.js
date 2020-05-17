import { DeviceDiscovery, Sonos, Helpers, Services } from 'sonos';
import request from 'axios';
import _ from 'lodash';

class SonosEnhanced extends Sonos {
    musicServices() {
        return new Services.MusicServices(this.host, this.port);
    }

    async getHouseholdId() {
        const data = await request(
            'http://' + this.host + ':' + this.port + '/status/zp'
        )
            .then((response) => response.data)
            .then(Helpers.ParseXml);

        return data.ZPSupportInfo.ZPInfo.HouseholdControlID;
    }

    async getAvailableServices() {
        const data = await this.musicServices().ListAvailableServices();

        const servicesObj = await Helpers.ParseXml(
            data.AvailableServiceDescriptorList
        );

        const serviceDescriptors = servicesObj.Services.Service.map((obj) => {
            const stringsUri = _.get(obj, 'Presentation.Strings.Uri');
            const mapUri = _.get(obj, 'Presentation.PresentationMap.Uri');
            const manifestUri = _.get(obj, 'Manifest.Uri');

            return _.assign({}, obj, obj.Policy, {
                manifestUri,
                presentation: {
                    stringsUri,
                    mapUri,
                },
            });
        });

        const services = [];

        data.AvailableServiceTypeList.split(',').forEach(async (t) => {
            const serviceId = Math.floor(Math.abs((t - 7) / 256)) || Number(t);
            const match = _.find(serviceDescriptors, {
                Id: String(serviceId),
            });

            if (match) {
                match.ServiceIDEncoded = Number(t);
                services.push(match);
            }
        });

        return services;
    }

    translateState(inputState) {
        switch (inputState) {
            case 'PAUSED_PLAYBACK':
                return 'paused';

            default:
                return inputState.toLowerCase();
        }
    }
}

export async function discoverMultiple(options = { timeout: 5000 }) {
    return new Promise((resolve, reject) => {
        const discovery = DeviceDiscovery(options);
        const devices = [];
        discovery.on('DeviceAvailable', (device, model) => {
            if (model.match(/^BR/)) {
                return;
            }

            devices.push(new SonosEnhanced(device.host));
        });

        discovery.once('timeout', () => {
            if (devices.length > 0) {
                resolve(devices);
            } else {
                reject(new Error('No devices found'));
            }
        });
    });
}

export function parseDIDL(didl) {
    if (!didl || didl === '' || !didl['DIDL-Lite'] || !didl['DIDL-Lite'].item) {
        return {};
    }

    const { item } = didl['DIDL-Lite'];

    return {
        title: item['dc:title'] || null,
        artist: item['dc:creator'] || null,
        album: item['upnp:album'] || null,
        class: item['upnp:class'] || null,
        albumArtURI: item['upnp:albumArtURI'] || null,
        originalTrackNumber: item['upnp:originalTrackNumber'] || null,
    };
}
