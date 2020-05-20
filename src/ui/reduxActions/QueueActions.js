import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

import store from '../reducers';
import getSelectionSeries from '../helpers/getSelectionSeries';

export const select = createAction(Constants.QUEUE_SELECT);
export const deselect = createAction(Constants.QUEUE_DESELECT);

export const flush = createAction(Constants.QUEUE_FLUSH, async () => {
    const sonos = SonosService._currentDevice; // TODO: fix this
    await sonos.flush();
    SonosService.queryState(sonos);
});

export const gotoPosition = createAction(
    Constants.QUEUE_GOTO,
    async (position) => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        await sonos.selectQueue();
        await sonos.selectTrack(position);
        await sonos.play();

        SonosService.queryState(sonos);

        return position;
    }
);

export const changePosition = createAction(
    Constants.QUEUE_REORDER,
    async (position, newPosition, updateId) => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        const avTransport = sonos.avTransportService();

        const params = {
            InstanceID: 0,
            StartingIndex: position,
            InsertBefore: newPosition,
            NumberOfTracks: 1,
            UpdateID: updateId,
        };

        await avTransport.ReorderTracksInQueue(params);

        SonosService.queryState(sonos);

        return {
            position,
            newPosition,
        };
    }
);

export const removeTrack = createAction(
    Constants.QUEUE_REMOVE,
    async (position) => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        const avTransport = sonos.avTransportService();

        const state = store.getState();
        const { currentHost } = state.sonosService;
        const { playerItems } = state.queue;
        const track = playerItems[currentHost].items[position - 1];

        const params = {
            InstanceID: 0,
            UpdateID: 0,
            StartingIndex: position,
            NumberOfTracks: 1,
        };

        await avTransport.RemoveTrackRangeFromQueue(params);

        SonosService.queryState(sonos);

        return [track.id];
    }
);

export const removeSelectedTracks = createAction(
    Constants.QUEUE_REMOVE_SELECTED,
    async () => {
        const sonos = SonosService._currentDevice; // TODO: fix this
        const avTransport = sonos.avTransportService();

        const state = store.getState();
        const { currentHost } = state.sonosService;
        const { selected, playerItems } = state.queue;
        const tracks = playerItems[currentHost].items;

        let removed = 0;

        getSelectionSeries(tracks, selected).forEach(async (arr) => {
            const StartingIndex = arr[0] - removed;
            const NumberOfTracks = arr.length;
            removed = removed + NumberOfTracks;

            const params = {
                InstanceID: 0,
                UpdateID: 0,
                StartingIndex: StartingIndex,
                NumberOfTracks: NumberOfTracks,
            };

            await avTransport.RemoveTrackRangeFromQueue(params);
        });

        SonosService.queryState(sonos);

        return selected;
    }
);
