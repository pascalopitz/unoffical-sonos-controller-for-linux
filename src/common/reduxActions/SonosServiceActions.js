import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import { Helpers } from 'sonos';
import { ipcRenderer } from 'electron';
import { createAction } from 'redux-actions';

import Constants from '../constants';

import { isStreamUrl, isFwdOnlyUrl } from '../helpers/sonos';

import SonosService from '../services/SonosService';

import store from '../reducers';

export const libraryIndexingUpdate = createAction(
    Constants.SONOS_SERVICE_LIBRARY_INDEX_UPDATE,
    async ({ host, status }) => {
        ipcRenderer.send('library-indexing', status);
        return { host, status };
    }
);

export const wakeup = createAction(Constants.SONOS_SERVICE_WAKEUP);

export const deviceSearchResult = createAction(
    Constants.SONOS_SERVICE_DEVICE_SEARCH_RESULT
);

export const topologyUpdate = createAction(
    Constants.SONOS_SERVICE_TOPOLOGY_UPDATE,
    (groups, attributes, devices) => ({
        groups,
        attributes,
        devices,
    })
);

export const selectCurrentZone = createAction(
    Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT,
    async (zone) => {
        const state = store.getState();
        const playState = state.sonosService.playStates[zone.host];

        ipcRenderer.send('playstate-update', playState);

        return zone;
    }
);

export const zoneGroupTrackUpdate = createAction(
    Constants.SONOS_SERVICE_ZONEGROUP_TRACK_UPDATE,
    async ({ track, host }) => {
        if (isStreamUrl(track.uri) || isFwdOnlyUrl(track.uri)) {
            const sonos = SonosService.getDeviceByHost(host);
            const avTransport = sonos.avTransportService();
            const mediaInfo = await avTransport.GetMediaInfo();

            const trackMeta = await Helpers.ParseXml(
                mediaInfo.CurrentURIMetaData
            ).then(Helpers.ParseDIDL);

            const currentTrack = await sonos.currentTrack();

            track = {
                ...track,
                ...omitBy(currentTrack, isEmpty),
                ...omitBy(trackMeta, isEmpty),
                isStreaming: true,
                disableNextButton: isStreamUrl(track.uri),
            };
        }

        return { track, host };
    }
);

export const queueUpdate = createAction(Constants.SONOS_SERVICE_QUEUE_UPDATE);

export const volumeUpdate = createAction(Constants.SONOS_SERVICE_VOLUME_UPDATE);

export const mutedUpdate = createAction(Constants.SONOS_SERVICE_MUTED_UPDATE);

export const renderingControlUpdate = createAction(
    Constants.SONOS_SERVICE_RENDERING_CONTROL_UPDATE
);

export const nextTrackUpdate = createAction(
    Constants.SONOS_SERVICE_NEXT_TRACK_UPDATE
);

export const playStateUpdate = createAction(
    Constants.SONOS_SERVICE_PLAYSTATE_UPDATE,
    async ({ host, playState }) => {
        const state = store.getState();
        const { currentHost } = state.sonosService;

        if (host === currentHost) {
            ipcRenderer.send('playstate-update', playState);
        }

        return { host, playState };
    }
);

export const positionInfoUpdate = createAction(
    Constants.SONOS_SERVICE_POSITION_INFO_UPDATE
);

export const mediaInfoUpdate = createAction(
    Constants.SONOS_SERVICE_MEDIA_INFO_UPDATE
);

export const crossfadeModeUpdate = createAction(
    Constants.SONOS_SERVICE_CURRENT_CROSSFADE_MODE_UPDATE
);

export const currentPlayModeUpdate = createAction(
    Constants.SONOS_SERVICE_CURRENT_PLAY_MODE_UPDATE
);

export const updateMusicServices = createAction(
    Constants.SONOS_SERVICE_MUSICSERVICES_UPDATE
);
