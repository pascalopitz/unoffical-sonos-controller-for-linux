import _ from 'lodash';

import { Listener, AsyncDeviceDiscovery } from 'sonos';

import { initialise as initialiseServiceLogos } from '../helpers/getServiceLogoUrl';
import SonosEnhanced from './enhanced/SonosEnhanced';

import * as serviceActions from '../reduxActions/SonosServiceActions';

import {
    getCurrentPlayer,
    getFirstPlayer,
} from '../selectors/ZoneGroupSelectors';

import store from '../reducers';

const SECOND_QUERY_INTERVAL = 60;
const SONOS_DISCOVERY_PORT = 1905;

function getSonosDeviceOrCurrentOrFirst(sonos) {
    const state = store.getState();
    return sonos || getCurrentPlayer(state) || getFirstPlayer(state);
}

function getAllDevices() {
    return Object.values(
        _.get(store.getState(), 'sonosService.deviceSearches', {})
    );
}

export function getDeviceByHost(host) {
    const deviceSearches = _.get(
        store.getState(),
        'sonosService.deviceSearches'
    );
    return deviceSearches[host];
}

async function getGroupAttributes(devices) {
    const map = {};

    for (const sonos of devices) {
        const attributes = await sonos
            .zoneGroupTopologyService()
            .GetZoneGroupAttributes();

        map[sonos.host] = {
            ...attributes,
            host: sonos.host,
        };
    }

    return map;
}

const SonosService = {
    _queryTimeout: null,
    _musicServices: [], // TODO: get rid of this

    getDeviceByHost,

    async mount() {
        await initialiseServiceLogos();
        this.searchForDevices();
        this.restoreMusicServices();
        store.dispatch(serviceActions.localFilesUpdate());
    },

    async wakeup() {
        store.dispatch(serviceActions.wakeup());
        store.dispatch(serviceActions.localFilesUpdate());
        setTimeout(() => this.searchForDevices(), 2000);
    },

    get _currentDevice() {
        return getSonosDeviceOrCurrentOrFirst();
    },

    async searchForDevices(timeout = 1000) {
        const { device } = await new AsyncDeviceDiscovery().discover({
            timeout,
            port: SONOS_DISCOVERY_PORT,
        });
        await this.connectDevice(device);
    },

    async connectDevice(device) {
        const groups = await device.getAllGroups();
        const devices = await Promise.all(
            groups.reduce(
                (p, z) => [
                    ...p,
                    ...z.ZoneGroupMember.map(async (m) => {
                        const uri = new URL(m.Location);
                        const host = uri.hostname;
                        const device = new SonosEnhanced(host);
                        await device.initialise();
                        return device;
                    }),
                ],
                []
            )
        );

        const [first] = devices;

        this.householdId = first.householdId;
        this.deviceId = first.deviceId;

        Listener.on('ZonesChanged', (...args) =>
            this.onZoneGroupTopologyEvent(...args)
        );

        Listener.on('ContentDirectory', (...args) =>
            this.onContentDirectoryEvent(...args)
        );

        Listener.on('AlarmClock', (...args) => this.onAlarmClockEvent(...args));

        for (const sonos of devices) {
            store.dispatch(serviceActions.deviceSearchResult(sonos));

            sonos.on('Queue', (...args) => this.onQueueEvent(sonos, ...args));

            sonos.on('GroupRenderingControl', (...args) =>
                this.onGroupRenderingControlEvent(sonos, ...args)
            );

            sonos.on('RenderingControl', (...args) =>
                this.onRenderingControlEvent(sonos, ...args)
            );

            sonos.on('Muted', (...args) => this.onMutedEvent(sonos, ...args));

            sonos.on('Volume', (...args) => this.onVolumeEvent(sonos, ...args));

            sonos.on('PlayState', (...args) =>
                this.onPlayStateEvent(sonos, ...args)
            );

            sonos.on('CurrentTrack', (...args) =>
                this.onCurrentTrackEvent(sonos, ...args)
            );

            sonos.on('NextTrack', (...args) =>
                this.onNextTrackEvent(sonos, ...args)
            );

            this.queryState(sonos);
        }

        const groupAttributes = await getGroupAttributes([...devices]);
        store.dispatch(
            serviceActions.topologyUpdate(groups, groupAttributes, devices)
        );

        const storedZone = window.localStorage.zone;
        const filteredGroups = storedZone
            ? groups.filter((g) => g.Coordinator === storedZone)
            : [];

        const [zone] =
            storedZone && filteredGroups.length ? filteredGroups : groups;

        store.dispatch(serviceActions.selectCurrentZone(zone || groups[0]));
        this.selectCurrentZone(first);
        this.queryCurrentTrackAndPlaystate(first);
    },

    async queryVolumeInfo(sonos) {
        if (!sonos) {
            return;
        }

        const { host } = sonos;

        const muted = await sonos.getMuted();
        const volume = await sonos.getVolume();

        store.dispatch(
            serviceActions.volumeUpdate({
                volume,
                muted,
                host,
            })
        );
    },

    async queryQueue(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        if (!sonos) {
            return;
        }

        const result = await sonos.getQueue().catch((err) => {
            console.error(err);
            return null;
        });

        store.dispatch(
            serviceActions.queueUpdate({
                result,
                host: sonos.host,
            })
        );
    },

    async queryCurrentTrackAndPlaystate(sonos) {
        try {
            const state = await sonos.getCurrentState();

            if (state === 'transitioning') {
                window.setTimeout(() => {
                    this.queryCurrentTrackAndPlaystate(sonos);
                }, 1000);
                return;
            }

            const track = await sonos.currentTrack();

            store.dispatch(
                serviceActions.zoneGroupTrackUpdate({
                    track: track,
                    host: sonos.host,
                })
            );
        } catch (e) {
            console.error(e);
        }
    },

    async queryPlayState(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);
        const state = await sonos.getCurrentState();
        this.processPlaystateUpdate(sonos, state);
    },

    async queryPositionInfo(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const avTransport = sonos.avTransportService();
        const info = await avTransport.GetPositionInfo();

        store.dispatch(
            serviceActions.positionInfoUpdate({
                host: sonos.host,
                info,
            })
        );
    },

    async queryCrossfadeMode(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const avTransport = sonos.avTransportService();
        const mode = await avTransport.GetCrossfadeMode({
            InstanceID: 0,
        });

        store.dispatch(
            serviceActions.crossfadeModeUpdate({
                host: sonos.host,
                mode: !!Number(mode.CrossfadeMode),
            })
        );
    },

    async queryTransportSettings(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        const avTransport = sonos.avTransportService();
        const result = await avTransport.GetTransportSettings({
            InstanceID: 0,
        });

        const currentPlayMode = result.PlayMode;

        store.dispatch(
            serviceActions.currentPlayModeUpdate({
                host: sonos.host,
                mode: currentPlayMode,
            })
        );
    },

    async queryLibraryIndexing(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);
        const contentDirectoryService = sonos.contentDirectoryService();
        const status = await contentDirectoryService.GetShareIndexInProgress();
        this.processLibraryIndexingUpdate(sonos, status);
    },

    async queryState(sonos) {
        sonos = getSonosDeviceOrCurrentOrFirst(sonos);

        if (!sonos) {
            return;
        }

        this.queryVolumeInfo(sonos);
        this.queryPositionInfo(sonos);
        this.queryQueue(sonos);
        this.queryPlayState(sonos);
        this.queryTransportSettings(sonos);
        this.queryCurrentTrackAndPlaystate(sonos);
        this.queryCrossfadeMode(sonos);
        this.queryLibraryIndexing(sonos);
    },

    processLibraryIndexingUpdate(sonos, status) {
        store.dispatch(
            serviceActions.libraryIndexingUpdate({
                status: status,
                host: sonos.host,
            })
        );
    },

    processPlaystateUpdate(sonos, state) {
        if (state === 'transitioning') {
            window.setTimeout(() => this.queryPlayState(sonos), 100);
        }

        store.dispatch(
            serviceActions.playStateUpdate({
                playState: state,
                host: sonos.host,
            })
        );
    },

    selectCurrentZone(value) {
        const { host } = value;
        const sonos = getDeviceByHost(host);

        if (sonos === this._currentDevice) {
            this.queryState(sonos);
            return;
        }

        if (sonos) {
            window.localStorage.zone = value.Coordinator;

            if (this._queryTimeout) {
                window.clearInterval(this._queryTimeout);
            }

            this.queryState(sonos);
            this._queryTimeout = window.setInterval(
                () => this.queryState(sonos),
                SECOND_QUERY_INTERVAL * 1000
            );
        }
    },

    async rememberMusicService(service, authToken) {
        this._musicServices.push({
            service: service,
            authToken: authToken,
        });

        window.localStorage.musicServices = JSON.stringify(this._musicServices);

        store.dispatch(serviceActions.updateMusicServices(this._musicServices));
    },

    removeMusicService(service) {
        let currentServices = JSON.parse(window.localStorage.musicServices);

        currentServices = _.reject(currentServices, (s) => {
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
    },

    onAlarmClockEvent(...args) {
        console.log('onAlarmClockEvent', ...args);
    },

    async onZoneGroupTopologyEvent(...args) {
        const sonos = getSonosDeviceOrCurrentOrFirst();

        console.log('onZoneGroupTopologyEvent', sonos.host, ...args);
        const groups = await sonos.getAllGroups();
        const devices = getAllDevices();
        const groupAttributes = await getGroupAttributes(devices);
        store.dispatch(
            serviceActions.topologyUpdate(groups, groupAttributes, devices)
        );
    },

    onQueueEvent(sonos, ...args) {
        console.log('onQueueEvent', sonos.host, ...args);
        this.queryState(sonos);
    },

    onRenderingControlEvent({ host }, update) {
        console.log('onRenderingControlEvent', host, update);
        store.dispatch(
            serviceActions.renderingControlUpdate({
                host,
                update,
            })
        );
    },

    onGroupRenderingControlEvent(sonos, ...args) {
        console.log('onGroupRenderingControlEvent', sonos.host, ...args);
        this.queryQueue(sonos);
    },

    onMutedEvent({ host }, muted) {
        console.log('onMutedEvent', host, muted);
        store.dispatch(
            serviceActions.mutedUpdate({
                muted,
                host,
            })
        );
    },

    onVolumeEvent({ host }, volume) {
        console.log('onVolumeEvent', host, volume);
        store.dispatch(
            serviceActions.volumeUpdate({
                volume,
                host,
            })
        );
    },

    onPlayStateEvent(sonos, transportState) {
        console.log('onPlayStateEvent', sonos.host, transportState);
        this.processPlaystateUpdate(sonos, transportState);
    },

    onCurrentTrackEvent({ host }, track) {
        console.log('onCurrentTrackEvent', host, track);
        store.dispatch(
            serviceActions.zoneGroupTrackUpdate({
                track,
                host,
            })
        );
    },

    onNextTrackEvent({ host }, track) {
        console.log('onNextTrackEvent', host, track);
        store.dispatch(
            serviceActions.nextTrackUpdate({
                host,
                track,
            })
        );
    },

    onContentDirectoryEvent({ eventBody }) {
        const sonos = getSonosDeviceOrCurrentOrFirst();

        const event = _.isArray(eventBody)
            ? eventBody.reduce((prev, i) => ({ ...prev, ...i }), {})
            : eventBody;

        this.queryQueue(sonos);

        if (event.ShareIndexInProgress) {
            this.processLibraryIndexingUpdate(
                sonos,
                event.ShareIndexInProgress !== '0'
            );
        }
    },
};

window.SonosService = SonosService;
export default SonosService;
