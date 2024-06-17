import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

import store from '../reducers';

import { home } from './BrowserListActions';

export const hide = createAction(Constants.PLAYLISTS_HIDE);

export const toggle = createAction(Constants.PLAYLISTS_TOGGLE);

export const saveQueue = createAction(
    Constants.PLAYLISTS_SAVE,
    async ({ Title = '', ObjectID = '' }) => {
        const sonos = SonosService._currentDevice;

        const list = await sonos.avTransportService().SaveQueue({
            InstanceID: 0,
            Title,
            ObjectID,
        });

        store.dispatch(hide());

        const historyIds = store
            .getState()
            .browserList.history.map((i) => i.id);

        if (historyIds.indexOf('SQ:') > -1) {
            store.dispatch(home());
        }

        return list;
    },
);

export const loadPlaylists = createAction(
    Constants.PLAYLISTS_LOAD,
    async () => {
        const sonos = SonosService._currentDevice;
        return await sonos.searchMusicLibrary('sonos_playlists');
    },
);

export const loadPlaylistItems = createAction(
    Constants.PLAYLISTS_ITEMS_LOAD,
    async (listId) => {
        const sonos = SonosService._currentDevice;
        return await sonos.queryMusicLibrary(listId);
    },
);

export const addItem = createAction(
    Constants.PLAYLISTS_ADD_ITEM,
    async (listId, item) => {
        const sonos = SonosService._currentDevice;

        let uri = item.uri;

        if (item.serviceClient) {
            const client = item.serviceClient;
            uri = client.getTrackURI(item, client._serviceDefinition.Id);
        }

        await sonos.addToPlaylist(listId, uri);

        store.dispatch(hide());
    },
);

export const deleteItem = createAction(
    Constants.PLAYLISTS_DELETE_ITEM,
    async (ObjectID, UpdateID = 0, position) => {
        const sonos = SonosService._currentDevice;

        const params = {
            ObjectID,
            UpdateID,
            InstanceID: 0,
            TrackList: position - 1,
            NewPositionList: '',
        };

        return await sonos
            .avTransportService()
            .ReorderTracksInSavedQueue(params);
    },
);

export const moveItem = createAction(
    Constants.PLAYLISTS_MOVE_ITEM,
    async (ObjectID, UpdateID = 0, oldPosition, newPosition) => {
        const sonos = SonosService._currentDevice;

        const params = {
            ObjectID,
            UpdateID,
            InstanceID: 0,
            TrackList: oldPosition - 1,
            NewPositionList: newPosition - 1,
        };

        return await sonos
            .avTransportService()
            .ReorderTracksInSavedQueue(params);
    },
);
