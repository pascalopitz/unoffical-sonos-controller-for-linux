import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

export const pause = createAction(Constants.PLAYER_PAUSE, async () => {
    const sonos = SonosService._currentDevice;
    await sonos.pause();
    SonosService.queryState();
});

export const play = createAction(Constants.PLAYER_PLAY, async () => {
    const sonos = SonosService._currentDevice;
    await sonos.play();
    SonosService.queryState();
});

export const playPrev = createAction(Constants.PLAYER_PREV, async () => {
    const sonos = SonosService._currentDevice;
    await sonos.previous();
    SonosService.queryState();
});

export const playNext = createAction(Constants.PLAYER_NEXT, async () => {
    const sonos = SonosService._currentDevice;
    await sonos.next();
    SonosService.queryState();
});

export const seek = createAction(Constants.PLAYER_SEEK, async (time) => {
    const sonos = SonosService._currentDevice;
    await sonos.seek(time);
    SonosService.queryState();
});

export const setPlayMode = createAction(
    Constants.OPTIMISTIC_CURRENT_PLAY_MODE_UPDATE,
    async (mode) => {
        const sonos = SonosService._currentDevice;
        const avTransport = sonos.avTransportService();

        await avTransport.SetPlayMode(mode);

        return {
            mode,
            host: sonos.host,
        };
    }
);

export const setCrossfade = createAction(
    Constants.OPTIMISTIC_CURRENT_CROSSFADE_MODE_UPDATE,
    async (mode) => {
        const sonos = SonosService._currentDevice;
        const avTransport = sonos.avTransportService();

        await avTransport.SetCrossfadeMode({
            InstanceID: 0,
            CrossfadeMode: Number(mode),
        });

        return {
            mode,
            host: sonos.host,
        };
    }
);

export const refreshPosition = createAction(
    Constants.SONOS_SERVICE_REFRESHPOSITION,
    async () => {
        SonosService.queryState();
    }
);
