import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

export const setPlayerMuted = createAction(
    Constants.VOLUME_CONTROLS_MUTE_SET,
    async (host, muted) => {
        const sonos = SonosService.getDeviceByHost(host);
        await sonos.setMuted(muted);
        return {
            host,
            muted,
        };
    }
);

export const setPlayerVolume = createAction(
    Constants.VOLUME_CONTROLS_VOLUME_SET,
    async (host, volume) => {
        const sonos = SonosService.getDeviceByHost(host);
        await sonos.setVolume(volume);
        return {
            host,
            volume,
        };
    }
);

export const setDragging = createAction(Constants.VOLUME_CONTROLS_DRAGGING);

export const setExpanded = createAction(Constants.VOLUME_CONTROLS_EXPANDED);

export const queryVolumes = createAction(
    Constants.VOLUME_CONTROLS_QUERY_VOLUMES,
    async () => {}
);
