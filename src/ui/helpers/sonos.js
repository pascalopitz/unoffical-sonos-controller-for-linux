import { DeviceDiscovery, Sonos, Helpers, Services } from 'sonos';
import request from 'axios';
import _ from 'lodash';

const TUNEIN_ID = 65031;

class RenderingControlEnhanced extends Services.RenderingControl {
    GetLoudness = async (Channel = 'Master') => {
        return this._request('GetLoudness', { InstanceID: 0, Channel });
    };

    SetLoudness = async (DesiredLoudness, Channel = 'Master') => {
        return this._request('SetLoudness', {
            InstanceID: 0,
            Channel,
            DesiredLoudness,
        });
    };

    GetBass = async () => {
        return this._request('GetBass', { InstanceID: 0 }).then((r) =>
            parseInt(r.CurrentBass)
        );
    };

    SetBass = async (bass) => {
        return this._request('SetBass', {
            InstanceID: 0,
            DesiredBass: bass,
        });
    };

    GetTreble = async () => {
        return this._request('GetTreble', { InstanceID: 0 }).then((r) =>
            parseInt(r.CurrentTreble)
        );
    };

    SetTreble = async (treble) => {
        return this._request('SetTreble', {
            InstanceID: 0,
            DesiredTreble: treble,
        });
    };
}

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
    constructor(host, model) {
        super(host);
        this.model = model;
    }

    musicServices() {
        return new Services.MusicServices(this.host, this.port);
    }

    renderingControlService() {
        return new RenderingControlEnhanced(this.host, this.port);
    }

    contentDirectoryService() {
        return new ContentDirectoryEnhanced(this.host, this.port);
    }

    groupRenderingControlService() {
        return new Services.GroupRenderingControl(this.host, this.port);
    }

    async getZPInfo() {
        const data = await request(
            'http://' + this.host + ':' + this.port + '/status/zp'
        )
            .then((response) => response.data)
            .then(Helpers.ParseXml);

        return data.ZPSupportInfo.ZPInfo;
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

        [TUNEIN_ID, ...data.AvailableServiceTypeList.split(',')].forEach(
            async (t) => {
                const serviceId =
                    Math.floor(Math.abs((t - 7) / 256)) || Number(t);
                const match = _.find(serviceDescriptors, {
                    Id: String(serviceId),
                });

                if (match) {
                    match.ServiceIDEncoded = Number(t);
                    services.push(match);
                }
            }
        );

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
            devices.push(new SonosEnhanced(device.host, model));
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

const STREAM_URL_PREFIXES = [
    `x-sonosapi-stream:`,
    `x-sonosapi-radio:`,
    `x-rincon-mp3radio:`,
    `hls-radio:`,
    `aac:`,
];

export function isStreamUrl(url) {
    if (!url) {
        return false;
    }

    const [prefix] = url.toLowerCase().split(':');
    return STREAM_URL_PREFIXES.indexOf(`${prefix}:`) > -1;
}
