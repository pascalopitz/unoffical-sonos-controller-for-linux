import { DeviceDiscovery, Sonos, Helpers, Services } from 'sonos';
import request from 'axios';
import _ from 'lodash';

class ContentDirectoryEnhanced extends Services.ContentDirectory {
    _enumItems(resultcontainer) {
        if (resultcontainer === undefined) {
            return;
        }

        if (!Array.isArray(resultcontainer)) {
            resultcontainer = [resultcontainer];
        }

        const convertItem = function (item) {
            const res = Helpers.ParseDIDLItem(
                item,
                this.host,
                this.port,
                _.get(item, 'res._')
            );

            return {
                ...res,
                class: item['upnp:class'],
                _raw: {
                    ...item,
                },
            };
        }.bind(this);

        return resultcontainer.map(convertItem);
    }
}

class SonosEnhanced extends Sonos {
    musicServices() {
        return new Services.MusicServices(this.host, this.port);
    }

    contentDirectoryService() {
        return new ContentDirectoryEnhanced(this.host, this.port);
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

    async queryMusicLibrary(
        searchType,
        searchTerm,
        requestOptions = {},
        separator = ':'
    ) {
        const searchTypes = {
            artists: 'A:ARTIST',
            albumArtists: 'A:ALBUMARTIST',
            albums: 'A:ALBUM',
            genres: 'A:GENRE',
            composers: 'A:COMPOSER',
            tracks: 'A:TRACKS',
            playlists: 'A:PLAYLISTS',
            sonos_playlists: 'SQ',
            share: 'S',
        };

        const defaultOptions = {
            BrowseFlag: 'BrowseDirectChildren',
            Filter: '*',
            StartingIndex: '0',
            RequestedCount: '100',
            SortCriteria: '',
        };

        let searches = searchTypes[searchType]
            ? `${searchTypes[searchType]}${separator}`
            : searchType;

        if (searchTerm && searchTerm !== '') {
            searches = `${searches}${separator}${encodeURIComponent(
                searchTerm
            )}`;
        }

        let opts = {
            ObjectID: searches,
        };
        if (requestOptions && requestOptions.start !== undefined) {
            opts.StartingIndex = requestOptions.start;
        }
        if (requestOptions && requestOptions.total !== undefined) {
            opts.RequestedCount = requestOptions.total;
        }
        // opts = _.extend(defaultOptions, opts)
        opts = Object.assign({}, defaultOptions, opts);
        const result = await this.contentDirectoryService().GetResult(opts);
        return result;
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
