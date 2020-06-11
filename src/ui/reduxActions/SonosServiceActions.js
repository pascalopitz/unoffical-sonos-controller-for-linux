import _ from 'lodash';

import { createAction } from 'redux-actions';
import Constants from '../constants';

import { Helpers } from 'sonos';
import { isStreamUrl } from '../helpers/sonos';

import SonosService from '../services/SonosService';

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
    Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT
);

export const zoneGroupTrackUpdate = createAction(
    Constants.SONOS_SERVICE_ZONEGROUP_TRACK_UPDATE,
    async ({ track, host }) => {
        if (isStreamUrl(track.uri)) {
            const sonos = SonosService.getDeviceByHost(host);
            const avTransport = sonos.avTransportService();
            const mediaInfo = await avTransport.GetMediaInfo();

            const trackMeta = await Helpers.ParseXml(
                mediaInfo.CurrentURIMetaData
            ).then(Helpers.ParseDIDL);

            const currentTrack = await sonos.currentTrack();

            track = {
                ...track,
                ..._.omitBy(currentTrack, _.isEmpty),
                ..._.omitBy(trackMeta, _.isEmpty),
                isStreaming: true,
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
    Constants.SONOS_SERVICE_PLAYSTATE_UPDATE
);

export const positionInfoUpdate = createAction(
    Constants.SONOS_SERVICE_POSITION_INFO_UPDATE
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
