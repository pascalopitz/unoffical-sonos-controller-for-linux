import { createAction } from 'redux-actions';
import Constants from '../constants';

export const deviceSearchResult = createAction(
    Constants.SONOS_SERVICE_DEVICE_SEARCH_RESULT
);

export const topologyUpdate = createAction(
    Constants.SONOS_SERVICE_TOPOLOGY_UPDATE
);
export const topologyEvent = createAction(
    Constants.SONOS_SERVICE_TOPOLOGY_EVENT
);

export const selectCurrentZone = createAction(
    Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT
);

export const zoneGroupTrackUpdate = createAction(
    Constants.SONOS_SERVICE_ZONEGROUP_TRACK_UPDATE
);

export const queueUpdate = createAction(Constants.SONOS_SERVICE_QUEUE_UPDATE);

export const volumeUpdate = createAction(Constants.SONOS_SERVICE_VOLUME_UPDATE);

export const currentTrackUpdate = createAction(
    Constants.SONOS_SERVICE_CURRENT_TRACK_UPDATE
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
