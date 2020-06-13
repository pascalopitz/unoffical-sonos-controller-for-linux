import _ from 'lodash';

import moment from 'moment';
import { Helpers } from 'sonos';

import SonosService from '../services/SonosService';

import store from '../reducers';

const NS = 'http://www.sonos.com/Services/1.1';
const deviceProviderName = 'Sonos';

function withinEnvelope(body, headers = '') {
    return [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="' +
            NS +
            '">',
        '<s:Header>' + headers + '</s:Header>',
        '<s:Body>' + body + '</s:Body>',
        '</s:Envelope>',
    ].join('');
}

function stripNamespaces(xml) {
    return xml.replace(/\<\/[\w\d-]+:/gi, '</').replace(/\<[\w\d-]+:/gi, '<');
}

class MusicServiceClient {
    constructor(serviceDefinition, { authToken, privateKey } = {}) {
        this._serviceDefinition = serviceDefinition;

        this.name = serviceDefinition.Name;
        this.auth = serviceDefinition.Auth;

        this.authToken = authToken;
        this.key = privateKey;
    }

    setAuthToken(token) {
        this.authToken = token;
    }

    setKey(key) {
        this.key = key;
    }

    async _doRequest(uri, action, requestBody, headers, retry = false) {
        const soapHeaders =
            typeof headers === 'function' ? headers.call(this) : headers;
        const soapBody = withinEnvelope(requestBody, soapHeaders);

        const response = await fetch(uri, {
            method: 'POST',
            headers: {
                SOAPAction: `"${NS}#${action}"`,
                'Content-type': 'text/xml; charset=utf8',
                'Accept-Language': 'en,en-AU;q=0.9,en-US;q=0.5',
            },
            body: soapBody,
        });

        const body = await response.text();

        const e = await Helpers.ParseXml(stripNamespaces(body));
        const fault = _.get(e, 'Envelope.Body.Fault.faultstring');

        if (response.status >= 400 || fault) {
            if (
                !retry &&
                fault &&
                (_.includes(fault, 'TokenRefreshRequired') ||
                    _.includes(fault, 'tokenRefreshRequired'))
            ) {
                const refreshDetails = _.get(
                    e,
                    'Envelope.Body.Fault.detail.refreshAuthTokenResult'
                );
                this.setAuthToken(refreshDetails.authToken);
                this.setKey(refreshDetails.privateKey);

                return this._doRequest(uri, action, requestBody, headers, true);
            }

            if (
                !retry &&
                fault &&
                _.includes(fault, 'Update your Sonos system')
            ) {
                return this._doRequest(uri, action, requestBody, headers, true);
            }

            throw new Error(fault);
        }

        return body;
    }

    getTrackURI(item, serviceId) {
        const trackId = item.id;
        const itemType = item.itemType;
        let protocol = 'x-sonos-http';
        let suffix = '.mp3';

        if (String(serviceId) === '12') {
            protocol = 'x-spotify';
            suffix = '';

            if (
                trackId.startsWith('spotify:track:') ||
                trackId.startsWith('spotify:artistRadio:')
            ) {
                return escape(trackId);
            }
        }

        if (
            _.includes(
                ['playlist', 'playList', 'artistTrackList', 'albumList'],
                itemType
            )
        ) {
            return 'x-rincon-cpcontainer:0006206c' + escape(trackId);
        }

        if (itemType === 'trackList') {
            return 'x-rincon-cpcontainer:000e206c' + escape(trackId);
        }

        if (itemType === 'album') {
            return 'x-rincon-cpcontainer:0004206c' + escape(trackId);
        }

        if (itemType === 'program') {
            return 'x-rincon-cpcontainer:000c206c' + escape(trackId);
        }

        if (itemType === 'stream') {
            return `x-sonosapi-stream:${escape(
                trackId
            )}?sid=${serviceId}&flags=8224&sn=14`;
        }

        // TODO: figure out why this doesn't work for Soundcloud
        // if (itemType === 'track') {
        //     return 'x-rincon-cpcontainer:00032020' + escape(trackId);
        // }

        return `${protocol}:${escape(
            trackId
        )}${suffix}?sid=${serviceId}&flags=8224&sn=1`;
    }

    // TODO: maybe we can use node-sonos Helpers.GenerateMetadata etc???
    encodeItemMetadata(uri, item) {
        const serviceType = this._serviceDefinition.ServiceIDEncoded;

        const TYPE_MAPPINGS = {
            track: {
                type: 'object.item.audioItem.musicTrack',
                token: '00032020',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            album: {
                type: 'object.container.album.musicAlbum',
                token: '0004206c',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            trackList: {
                type: 'object.container.playlistContainer',
                token: '000e206c',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            albumList: {
                type: 'object.container.playlistContainer',
                token: '0006206c',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            playlist: {
                type: 'object.container.playlistContainer',
                token: '0006206c',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            playList: {
                type: 'object.container.playlistContainer',
                token: '0006206c',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            artistTrackList: {
                type: 'object.container.playlistContainer',
                token: '0006206c',
                serviceString: `SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token`,
            },
            stream: {
                type: 'object.item.audioItem.audioBroadcast',
                token: '10092020',
                parentId: 'parentID="-1"',
                serviceString: `SA_RINCON${serviceType}_`,
            },
            program: {
                type:
                    'object.item.audioItem.audioBroadcast.#' + item.displayType,
                token: '000c206c',
                serviceString: `SA_RINCON${serviceType}_`,
            },
        };

        let resourceString,
            id,
            trackData,
            parentId = '';

        const serviceString = TYPE_MAPPINGS[item.itemType].serviceString;

        if (serviceString) {
            const prefix = TYPE_MAPPINGS[item.itemType].token;
            id = prefix + escape(item.id);
            parentId = TYPE_MAPPINGS[item.itemType].parentId || '';
            resourceString = `<desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">${serviceString}</desc>`;
        } else {
            id = '-1';
            const d = moment.duration(item.trackMetadata.duration || 0);
            resourceString = `<res protocolInfo="${uri.match(/^[\w\-]+:/)[0]}*${
                item.mimeType
            }*"
                duration="${_.padStart(d.hours(), 2, '0')}:${_.padStart(
                d.minutes(),
                2,
                '0'
            )}:${_.padStart(d.seconds(), 2, '0')}">${_.escape(uri)}</res>`;
        }

        if (item.trackMetadata) {
            trackData = `<dc:creator>${_.escape(
                item.trackMetadata.artist
            )}</dc:creator>
            <upnp:albumArtURI>${
                item.trackMetadata.albumArtURI || ''
            }</upnp:albumArtURI>
            <upnp:album>${_.escape(
                item.trackMetadata.album || ''
            )}</upnp:album>`;
        }

        const didl = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
        xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/"
        xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
        <item id="${id}" restricted="true" ${parentId}>
        ${resourceString}
        <dc:title>${_.escape(item.title)}</dc:title>
        <upnp:class>${TYPE_MAPPINGS[item.itemType].type}</upnp:class>
        ${trackData || ''}
        </item>
        </DIDL-Lite>`;

        return {
            metadata: didl,
            class: TYPE_MAPPINGS[item.itemType].type,
        };
    }

    getDeviceLinkCode() {
        const headers = [
            '<ns:credentials>',
            '<ns:deviceId>',
            SonosService.deviceId,
            '</ns:deviceId>',
            '<ns:deviceProvider>',
            deviceProviderName,
            '</ns:deviceProvider>',
            '</ns:credentials>',
        ].join('');

        const body = [
            '<ns:getDeviceLinkCode>',
            '<ns:householdId>',
            SonosService.householdId,
            '</ns:householdId>',
            '</ns:getDeviceLinkCode>',
        ].join('');

        return this._doRequest(
            this._serviceDefinition.SecureUri,
            'getDeviceLinkCode',
            body,
            headers
        ).then(async (res) => {
            const resp = await Helpers.ParseXml(stripNamespaces(res));
            const obj =
                resp['Envelope']['Body']['getDeviceLinkCodeResponse'][
                    'getDeviceLinkCodeResult'
                ];
            return obj;
        });
    }

    getAppLink() {
        const headers = ['<ns:credentials>', '</ns:credentials>'].join('');

        const body = [
            '<ns:getAppLink>',
            '<ns:householdId>',
            SonosService.householdId,
            '</ns:householdId>',
            '</ns:getAppLink>',
        ].join('');

        return this._doRequest(
            this._serviceDefinition.SecureUri,
            'getAppLink',
            body,
            headers
        ).then(async (res) => {
            const resp = await Helpers.ParseXml(stripNamespaces(res));
            const obj =
                resp['Envelope']['Body']['getAppLinkResponse'][
                    'getAppLinkResult'
                ];
            return obj.authorizeAccount.deviceLink;
        });
    }

    getDeviceAuthToken(linkCode, linkDeviceId) {
        const headers = [
            '<ns:credentials>',
            '<ns:deviceId>',
            SonosService.deviceId,
            '</ns:deviceId>',
            '<ns:deviceProvider>',
            deviceProviderName,
            '</ns:deviceProvider>',
            '</ns:credentials>',
        ].join('');

        const body = [
            '<ns:getDeviceAuthToken>',
            '<ns:householdId>',
            SonosService.householdId,
            '</ns:householdId>',
            '<ns:linkCode>',
            linkCode,
            '</ns:linkCode>',
            '<ns:linkDeviceId>',
            linkDeviceId,
            '</ns:linkDeviceId>',
            '</ns:getDeviceAuthToken>',
        ].join('');

        return this._doRequest(
            this._serviceDefinition.SecureUri,
            'getDeviceAuthToken',
            body,
            headers
        )
            .then(async (res) => {
                const resp = await Helpers.ParseXml(stripNamespaces(res));
                const obj =
                    resp['Envelope']['Body']['getDeviceAuthTokenResponse'][
                        'getDeviceAuthTokenResult'
                    ];
                return obj;
            })
            .catch((err) => {
                if (err.message.indefOf('NOT_LINKED_RETRY') > -1) {
                    // noop
                }

                throw err;
            });
    }

    getMetadata(id, index = 0, count = 200) {
        const body = [
            '<ns:getMetadata>',
            '<ns:id>',
            id,
            '</ns:id>',
            '<ns:index>',
            index,
            '</ns:index>',
            '<ns:count>',
            count,
            '</ns:count>',
            '<ns:recursive>false</ns:recursive>',
            '</ns:getMetadata>',
        ].join('');

        return new Promise((resolve, reject) => {
            this._doRequest(
                this._serviceDefinition.SecureUri,
                'getMetadata',
                body,
                this.getAuthHeaders
            )
                .then(async (res) => {
                    const resp = await Helpers.ParseXml(stripNamespaces(res));
                    const obj =
                        resp['Envelope']['Body']['getMetadataResponse'][
                            'getMetadataResult'
                        ];
                    resolve(obj);
                })
                .catch((response) => {
                    reject(response);
                });
        });
    }

    getExtendedMetadata(id) {
        const body = [
            '<ns:getExtendedMetadata>',
            '<ns:id>',
            id,
            '</ns:id>',
            '</ns:getExtendedMetadata>',
        ].join('');

        return new Promise((resolve, reject) => {
            this._doRequest(
                this._serviceDefinition.SecureUri,
                'getExtendedMetadata',
                body,
                this.getAuthHeaders
            )
                .then(async (res) => {
                    const resp = await Helpers.ParseXml(stripNamespaces(res));
                    const obj =
                        resp['Envelope']['Body']['getExtendedMetadataResponse'][
                            'getExtendedMetadataResult'
                        ];
                    resolve(obj);
                })
                .catch((response) => {
                    reject(response);
                });
        });
    }

    search(id, term, index = 0, count = 200) {
        const body = [
            '<ns:search>',
            '<ns:id>',
            id,
            '</ns:id>',
            '<ns:term>',
            _.escape(term),
            '</ns:term>',
            '<ns:index>',
            index,
            '</ns:index>',
            '<ns:count>',
            count,
            '</ns:count>',
            '</ns:search>',
        ].join('');

        return new Promise((resolve, reject) => {
            return this._doRequest(
                this._serviceDefinition.SecureUri,
                'search',
                body,
                this.getAuthHeaders
            )
                .then(async (res) => {
                    const resp = await Helpers.ParseXml(stripNamespaces(res));
                    const obj =
                        resp['Envelope']['Body']['searchResponse'][
                            'searchResult'
                        ];
                    resolve(obj);
                })
                .catch((response) => {
                    reject(response);
                });
        });
    }

    getMediaURI(id) {
        const body = [
            '<ns:getMediaURI>',
            '<ns:id>',
            id,
            '</ns:id>',
            '</ns:getMediaURI>',
        ].join('');

        return new Promise((resolve, reject) => {
            return this._doRequest(
                this._serviceDefinition.SecureUri,
                'getMediaURI',
                body,
                this.getAuthHeaders
            )
                .then(async (res) => {
                    const resp = await Helpers.ParseXml(stripNamespaces(res));
                    const obj =
                        resp['Envelope']['Body']['getMediaURIResponse'][
                            'getMediaURIResult'
                        ];
                    return resolve(obj);
                })
                .catch((response) => {
                    reject(response);
                });
        });
    }

    getSessionId(username, password) {
        const headers = [
            '<ns:credentials>',
            '<ns:deviceId>',
            SonosService.deviceId,
            '</ns:deviceId>',
            '<ns:deviceProvider>',
            deviceProviderName,
            '</ns:deviceProvider>',
            '</ns:credentials>',
        ].join('');

        const body = [
            '<ns:getSessionId>',
            '<ns:username>',
            username,
            '</ns:username>',
            '<ns:password>',
            password,
            '</ns:password>',
            '</ns:getSessionId>',
        ].join('');

        return this._doRequest(
            this._serviceDefinition.SecureUri,
            'getSessionId',
            body,
            headers
        ).then(async (res) => {
            const resp = await Helpers.ParseXml(stripNamespaces(res));
            const obj =
                resp['Envelope']['Body']['getSessionIdResponse'][
                    'getSessionIdResult'
                ];
            return obj;
        });
    }

    getAuthHeaders() {
        if (this.auth === 'UserId') {
            return [
                '<ns:credentials>',
                '<ns:deviceId>',
                SonosService.deviceId,
                '</ns:deviceId>',
                '<ns:deviceProvider>',
                deviceProviderName,
                '</ns:deviceProvider>',
                '<ns:sessionId>',
                this.authToken,
                '</ns:sessionId>',
                '</ns:credentials>',
            ].join('');
        }

        if (this.auth === 'DeviceLink' || this.auth === 'AppLink') {
            return [
                '<ns:credentials>',
                '<ns:deviceId>',
                SonosService.deviceId,
                '</ns:deviceId>',
                '<ns:deviceProvider>',
                deviceProviderName,
                '</ns:deviceProvider>',
                '<ns:loginToken>',
                '<ns:token>',
                this.authToken,
                '</ns:token>',
                '<ns:key>',
                this.key,
                '</ns:key>',
                '<ns:householdId>',
                SonosService.householdId.split('.')[0],
                '</ns:householdId>',
                '</ns:loginToken>',
                '</ns:credentials>',
            ].join('');
        }

        return [
            '<ns:credentials>',
            '<ns:deviceId>',
            SonosService.deviceId,
            '</ns:deviceId>',
            '<ns:deviceProvider>',
            deviceProviderName,
            '</ns:deviceProvider>',
            '</ns:credentials>',
        ].join('');
    }

    async getSearchTermMap() {
        let mapUri = this._serviceDefinition.presentation.mapUri;

        if (this._serviceDefinition.manifestUri) {
            const res = await fetch(this._serviceDefinition.manifestUri);
            const jsonRes = await res.json();

            if (jsonRes.presentationMap.uri) {
                mapUri = jsonRes.presentationMap.uri;
            }
        }

        if (!this.searchTermMap && mapUri) {
            const res = await fetch(mapUri);

            if (res.status < 400) {
                const body = await res.text();
                const e = await Helpers.ParseXml(stripNamespaces(body));

                const map = _.find(
                    e.Presentation.PresentationMap,
                    (m) => !!_.get(m, 'Match.SearchCategories')
                );

                let searchCategories = _.get(map, 'Match.SearchCategories');

                if (_.isArray(searchCategories)) {
                    searchCategories = searchCategories[0];
                }

                this.searchTermMap = _.get(searchCategories, 'Category');
            }

            // INFO: https://github.com/SoCo/SoCo/blob/daba00b93b939fb4079778b4ed5a9abe07922c85/soco/music_services/music_service.py#L528
            if (res.status === 404 && this.name === 'TuneIn') {
                this.searchTermMap = [
                    { id: 'stations', mappedId: 'search:station' },
                    { id: 'shows', mappedId: 'search:show' },
                    { id: 'hosts', mappedId: 'search:host' },
                ];
            }
        }

        return this.searchTermMap;
    }
}

export const getByServiceId = (sid) => {
    const {
        musicServices: { active: activeServices },
    } = store.getState();

    const serviceDefinition = activeServices.find((s) => s.service.Id === sid);

    if (!serviceDefinition) {
        return null;
    }

    return new MusicServiceClient(
        serviceDefinition.service,
        serviceDefinition.authToken || {}
    );
};

export default MusicServiceClient;
