import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';
import serviceFactory from '../sonos/helpers/ServiceFactory';

export const pause = createAction(Constants.PLAYER_PAUSE, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.pauseAsync();
    SonosService.queryState();
});

export const play = createAction(Constants.PLAYER_PLAY, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.playAsync();
    SonosService.queryState();
});

export const playPrev = createAction(Constants.PLAYER_PREV, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.previousAsync();
    SonosService.queryState();
});

export const playNext = createAction(Constants.PLAYER_NEXT, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.nextAsync();
    SonosService.queryState();
});

export const seek = createAction(Constants.PLAYER_SEEK, async time => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.seekAsync(time);
    SonosService.queryState();
});

export const setPlayMode = createAction(
    Constants.OPTIMISTIC_CURRENT_PLAY_MODE_UPDATE,
    async mode => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        const avTransport = serviceFactory('AVTransport', sonos);

        await avTransport.SetPlayModeAsync({
            InstanceID: 0,
            NewPlayMode: mode
        });

        return mode;
    }
);

export const setCrossfade = createAction(
    Constants.OPTIMISTIC_CURRENT_CROSSFADE_MODE_UPDATE,
    async mode => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        const avTransport = serviceFactory('AVTransport', sonos);

        await avTransport.SetCrossfadeModeAsync({
            InstanceID: 0,
            CrossfadeMode: Number(mode)
        });

        return mode;
    }
);

export const refreshPosition = createAction(Constants.NOOP, async () => {
    SonosService.queryState();
});
