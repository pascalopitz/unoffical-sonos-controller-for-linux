import _ from 'lodash';

import bb from 'bluebird';
import xml2json from 'jquery-xml2json';

import serviceFactory from '../sonos/helpers/ServiceFactory';
import { initialise as intialiseServiceLogos } from '../helpers/getServiceLogoUrl';

import Search from '../sonos/Search';
import Listener from '../sonos/events/listener';

import * as serviceActions from '../reduxActions/SonosServiceActions';

import store from '../reducers';

import { getZoneGroups } from '../selectors/ZoneGroupSelectors';

const REG = /^http:\/\/([\d\.]+)/;
const SECOND_QUERY_INTERVAL = 60;

function getCurrentZone() {
    const { currentHost, deviceSearches } = store.getState().sonosService;
    return deviceSearches[currentHost];
}

function getAllZones() {
    return getZoneGroups(store.getState());
}

function getSonosDeviceOrCurrentOrFirst(sonos) {
    return (
        sonos ||
        getCurrentZone() ||
        _.first(_.get(store.getState(), 'sonosService.deviceSearches'))
    );
}

function getDeviceByHost(host) {
    const deviceSearches = _.get(
        store.getState(),
        'sonosService.deviceSearches'
    );
    return deviceSearches[host];
}

const SonosService = {
    _currentDevice: null, // TODO: get rid of this
    _queryTimeout: null,
    _listeners: {},
    _persistentSubscriptions: [],
    _currentSubscriptions: [],
    _searchInterval: null,
    _musicServices: [], // TODO: get rid of this

    getDeviceByHost,

    async mount() {
        this._searchInterval = window.setInterval(
            this.searchForDevices.bind(this),
            1000
        );
        await intialiseServiceLogos();
        this.searchForDevices();
        this.restoreMusicServices();
    },

    async searchForDevices() {
        let firstResultProcessed = false;

        this.search = new Search(sonos => {
            if (sonos.model.match(/^BR/)) {
                return;
            }

            bb.promisifyAll(sonos);
            store.dispatch(serviceActions.deviceSearchResult(sonos));

            if (this._searchInterval) {
                window.clearInterval(this._searchInterval);
            }

            const listener = new Listener(sonos);

            this._listeners[sonos.host] = listener;

            listener.listen(async err => {
                if (err) {
                    throw err;
                }

                listener.onServiceEvent(this.onServiceEvent.bind(this));

                const persistSubscription = (err, sid) => {
                    if (!err) {
                        this._persistentSubscriptions.push({
                            sid: sid,
                            host: sonos.host,
                            sonos: sonos
                        });
                    }
                };

                // these events happen for all players
                listener.addService(
                    '/MediaRenderer/RenderingControl/Event',
                    persistSubscription
                );
                listener.addService(
                    '/MusicServices/Event',
                    persistSubscription
                );
                listener.addService(
                    '/MediaRenderer/AVTransport/Event',
                    persistSubscription
                );
                listener.addService(
                    '/SystemProperties/Event',
                    persistSubscription
                );
                listener.addService(
                    '/ZoneGroupTopology/Event',
                    persistSubscription
                );

                this.queryCurrentTrackAndPlaystate(sonos);
                this.queryTopology(sonos);

                if (!firstResultProcessed) {
                    this.queryAccounts(sonos);

                    this.householdId = await sonos
                        .getHouseholdIdAsync()
                        .catch(() => null);

                    firstResultProcessed = true;
                }
            });
        });
    },

    async queryTopology(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const currentZone = getCurrentZone();
        let currentGroupMatch;

        const info = await sonos.getTopologyAsync();

        // find out whether current group still exists
        if (currentZone) {
            currentGroupMatch = _(info.zones).find({
                group: currentZone.group
            });
        }

        if (!currentGroupMatch || !currentZone) {
            let zone = _(info.zones)
                .reject(function(z) {
                    return z.name.toLocaleLowerCase().match('bridge');
                })
                .reject(function(z) {
                    return z.name.toLocaleLowerCase().match('boost');
                })
                .find({
                    coordinator: 'true'
                });

            if (window.localStorage.zone) {
                const match = _(info.zones)
                    .reject(function(z) {
                        return z.name.toLocaleLowerCase().match('bridge');
                    })
                    .reject(function(z) {
                        return z.name.toLocaleLowerCase().match('boost');
                    })
                    .find({
                        uuid: window.localStorage.zone,
                        coordinator: 'true'
                    });

                zone = match || zone;
            }

            // HACK: trying to prevent listener not having server throw, race condition?
            window.setTimeout(() => {
                this.selectCurrentZone(zone);
                store.dispatch(serviceActions.selectCurrentZone(zone));
            }, 500);
        }

        store.dispatch(serviceActions.topologyUpdate(info.zones));
    },

    queryVolumeInfo() {
        const topology = getAllZones();

        for (const key of _.keys(topology)) {
            const players = topology[key];

            players.forEach(async m => {
                const [, host] = REG.exec(m.location);
                const sonos = getDeviceByHost(host);

                const muted = await sonos.getMutedAsync();
                const volume = await sonos.getVolumeAsync();

                store.dispatch(
                    serviceActions.volumeUpdate({
                        volume,
                        muted,
                        host
                    })
                );
            });
        }
    },

    async queryMusicLibrary(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const result = await sonos
            .getMusicLibraryAsync('queue', {})
            .catch(() => null);

        store.dispatch(
            serviceActions.queueUpdate({
                result,
                host: sonos.host
            })
        );
    },

    async queryCurrentTrackAndPlaystate(sonos) {
        try {
            const state = await sonos.getCurrentStateAsync();

            if (state === 'transitioning') {
                window.setTimeout(() => {
                    this.queryCurrentTrackAndPlaystate(sonos);
                }, 1000);
                return;
            }

            let track = await sonos.currentTrackAsync();

            if (track.class === 'object.item') {
                const mediaInfo = await sonos.getMediaInfoAsync();

                const trackMeta = sonos.parseDIDL(
                    xml2json(mediaInfo.CurrentURIMetaData, {
                        explicitArray: true
                    })
                );

                track = Object.assign(track, trackMeta);
            }

            store.dispatch(
                serviceActions.zoneGroupTrackUpdate({
                    track: track,
                    host: sonos.host,
                    playState: state
                })
            );
        } catch (e) {
            console.error(e);
        }
    },

    async queryPlayState(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);
        const state = await sonos.getCurrentStateAsync();
        this.processPlaystateUpdate(sonos, state);
    },

    async queryPositionInfo(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        // TODO: I should be able to do all of these in a promise based op
        // i.e. seek->getPosition
        const info = await sonos.getPositionInfoAsync();

        store.dispatch(
            serviceActions.positionInfoUpdate({
                host: sonos.host,
                info
            })
        );
    },

    async queryCrossfadeMode(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const avTransport = serviceFactory('AVTransport', sonos);
        const mode = await avTransport.GetCrossfadeModeAsync({
            InstanceID: 0
        });

        store.dispatch(
            serviceActions.crossfadeModeUpdate({
                host: sonos.host,
                mode: !!Number(mode.CrossfadeMode)
            })
        );
    },

    async queryTransportSettings(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const avTransport = serviceFactory('AVTransport', sonos);
        const result = await avTransport.GetTransportSettingsAsync({
            InstanceID: 0
        });

        const currentPlayMode = result.PlayMode;

        store.dispatch(
            serviceActions.currentPlayModeUpdate({
                host: sonos.host,
                mode: currentPlayMode
            })
        );
    },

    async queryState(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        this.queryVolumeInfo();

        // this.queryTopology(sonos);
        this.queryPositionInfo(sonos);
        this.queryMusicLibrary(sonos);
        this.queryPlayState(sonos);
        this.queryTransportSettings(sonos);
        this.queryCurrentTrackAndPlaystate(sonos);
        this.queryCrossfadeMode(sonos);
    },

    async queryAccounts(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);
        const info = await sonos.getAccountStatusAsync();
        this._accountInfo = info;
    },

    processPlaystateUpdate(sonos, state) {
        if (state === 'transitioning') {
            window.setTimeout(() => this.queryPlayState(sonos), 100);
        }

        store.dispatch(
            serviceActions.playStateUpdate({
                playState: state,
                host: sonos.host
            })
        );
    },

    onServiceEvent(endpoint, sid, data) {
        const subscription =
            _(this._persistentSubscriptions).find({
                sid: sid
            }) || {};

        switch (endpoint) {
            case '/SystemProperties/Event':
            case '/MusicServices/Event':
            case '/MediaRenderer/DeviceProperties/Event':
                break;

            case '/ZoneGroupTopology/Event':
                {
                    // Transform the message into the same format as sonos.getTopology
                    const topology = xml2json(data.ZoneGroupState, {
                        explicitArray: true
                    });

                    const zones = [];

                    _.forEach(topology.ZoneGroups.ZoneGroup, zg => {
                        const cId = zg.$.Coordinator;
                        const gId = zg.$.ID;

                        _.forEach(zg.ZoneGroupMember, z => {
                            const zone = {};
                            zone.group = gId;
                            Object.keys(z.$).forEach(k => {
                                zone[String(k).toLowerCase()] = String(z.$[k]);
                            });
                            zone.name = zone.zonename;
                            delete zone.zonename;

                            if (cId === zone.uuid) {
                                zone.coordinator = 'true';
                            }

                            zones.push(zone);
                        });
                    });

                    store.dispatch(serviceActions.topologyEvent(zones));
                }
                break;

            case '/MediaRenderer/RenderingControl/Event':
                {
                    const lastChange = xml2json(data.LastChange, {
                        explicitArray: false
                    });

                    if (subscription) {
                        store.dispatch(
                            serviceActions.volumeUpdate({
                                volume: Number(
                                    lastChange.Event.InstanceID.Volume[0].$.val
                                ),
                                muted: Boolean(
                                    Number(
                                        lastChange.Event.InstanceID.Mute[0].$
                                            .val
                                    )
                                ),
                                host: subscription.host
                            })
                        );
                    }
                }
                break;

            case '/MediaRenderer/AVTransport/Event':
                {
                    const lastChange = xml2json(data.LastChange);
                    const subscription = _(this._persistentSubscriptions).find({
                        sid: sid
                    });

                    if (subscription) {
                        const transportState = subscription.sonos.translateState(
                            lastChange.Event.InstanceID.TransportState.$.val
                        );

                        const avTransportMetaDIDL = xml2json(
                            lastChange.Event.InstanceID.AVTransportURIMetaData.$
                                .val,
                            {
                                explicitArray: true
                            }
                        );

                        const currentTrackDIDL = xml2json(
                            lastChange.Event.InstanceID.CurrentTrackMetaData.$
                                .val,
                            {
                                explicitArray: true
                            }
                        );

                        store.dispatch(
                            serviceActions.zoneGroupTrackUpdate({
                                track: subscription.sonos.parseDIDL(
                                    currentTrackDIDL
                                ),
                                avTransportMeta: this._currentDevice.parseDIDL(
                                    avTransportMetaDIDL
                                ),
                                host: subscription.host,
                                playState: transportState
                            })
                        );

                        const currentPlayMode =
                            lastChange.Event.InstanceID.CurrentPlayMode.$.val;

                        const currentCrossfadeMode = Boolean(
                            Number(
                                lastChange.Event.InstanceID.CurrentCrossfadeMode
                                    .$.val
                            )
                        );

                        const nextTrackDIDL = xml2json(
                            lastChange.Event.InstanceID['r:NextTrackMetaData'].$
                                .val,
                            {
                                explicitArray: true
                            }
                        );

                        store.dispatch(
                            serviceActions.currentPlayModeUpdate({
                                host: subscription.host,
                                mode: currentPlayMode
                            })
                        );

                        store.dispatch(
                            serviceActions.crossfadeModeUpdate({
                                host: subscription.host,
                                mode: currentCrossfadeMode
                            })
                        );

                        store.dispatch(
                            serviceActions.nextTrackUpdate({
                                host: subscription.host,
                                track: this._currentDevice.parseDIDL(
                                    nextTrackDIDL
                                )
                            })
                        );

                        this.processPlaystateUpdate(
                            subscription.sonos,
                            transportState
                        );
                    }
                }
                break;

            case '/MediaServer/ContentDirectory/Event':
                {
                    this.queryMusicLibrary();
                }
                break;
        }
    },

    subscribeServiceEvents(sonos) {
        const x = this._listeners[sonos.host];

        const cb = (error, sid) => {
            if (error) {
                throw error;
            }
            this._currentSubscriptions.push(sid);
        };

        x.addService('/MediaRenderer/GroupRenderingControl/Event', cb);
        x.addService('/MediaServer/ContentDirectory/Event', cb);
    },

    unsubscribeServiceEvents(sonos) {
        const x = this._listeners[sonos.host];

        this._currentSubscriptions.forEach(sid => {
            x.removeService(sid, error => {
                if (error) {
                    throw error;
                }
                // console.log('Successfully unsubscribed');
            });
        });

        this._currentSubscriptions = [];
    },

    selectCurrentZone(value) {
        const [, host] = REG.exec(value.location);
        const sonos = getDeviceByHost(host);

        if (sonos === this._currentDevice) {
            this.queryState(sonos);
            return;
        }

        window.localStorage.zone = value.uuid;

        if (sonos) {
            if (this._currentDevice) {
                this.unsubscribeServiceEvents(this._currentDevice);
            }

            if (this._queryTimeout) {
                window.clearInterval(this._queryTimeout);
            }

            this._currentDevice = sonos;

            this.subscribeServiceEvents(sonos);
            this.queryState(sonos);
            this._queryTimeout = window.setInterval(
                () => this.queryState(),
                SECOND_QUERY_INTERVAL * 1000
            );
        }
    },

    async rememberMusicService(service, authToken) {
        this._musicServices.push({
            service: service,
            authToken: authToken
        });

        window.localStorage.musicServices = JSON.stringify(this._musicServices);

        store.dispatch(serviceActions.updateMusicServices(this._musicServices));
    },

    removeMusicService(service) {
        let currentServices = JSON.parse(window.localStorage.musicServices);

        currentServices = _.reject(currentServices, s => {
            return s.service.Id == service.Id;
        });

        window.localStorage.musicServices = JSON.stringify(currentServices);
        this._musicServices = currentServices;

        store.dispatch(serviceActions.updateMusicServices(this._musicServices));
    },

    restoreMusicServices() {
        this._musicServices = window.localStorage.musicServices
            ? JSON.parse(window.localStorage.musicServices)
            : [];

        store.dispatch(serviceActions.updateMusicServices(this._musicServices));
    }
};

window.SonosService = SonosService;

window.onbeforeunload = e => {
    try {
        SonosService.search.destroy();
    } catch (e) {
        console.error(e);
    }

    try {
        for (const l of SonosService._listeners) {
            l.destroy();
        }
    } catch (e) {
        console.error(e);
    }
    // e.preventDefault();
};

export default SonosService;
