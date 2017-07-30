import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';
import serviceFactory from '../sonos/helpers/ServiceFactory';

export const select = createAction(Constants.QUEUE_SELECT);
export const deselect = createAction(Constants.QUEUE_DESELECT);

export const flush = createAction(Constants.QUEUE_FLUSH, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.flushAsync();
});

export const gotoPosition = createAction(
    Constants.QUEUE_GOTO,
    async position => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        await sonos.selectQueueAsync();
        await sonos.gotoAsync(position);
        await sonos.playAsync(position);
        return position;
    }
);

export const changePosition = createAction(
    Constants.QUEUE_REORDER,
    async (position, newPosition) => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        const avTransport = serviceFactory('AVTransport', sonos);

        const params = {
            InstanceID: 0,
            StartingIndex: position,
            InsertBefore: newPosition,
            NumberOfTracks: 1,
            UpdateID: QueueStore.getUpdateID()
        };

        await avTransport.ReorderTracksInQueueAsync(params);

        return {
            position,
            newPosition
        };
    }
);

export const removeTrack = createAction(Constants.QUEUE_REMOVE, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    const avTransport = serviceFactory('AVTransport', sonos);

    const params = {
        InstanceID: 0,
        UpdateID: 0,
        StartingIndex: position,
        NumberOfTracks: 1
    };

    await avTransport.RemoveTrackRangeFromQueueAsync(params);
});

export const removeSelected = createAction(
    Constants.QUEUE_REMOVE_SELECTED,
    async () => {}
);
