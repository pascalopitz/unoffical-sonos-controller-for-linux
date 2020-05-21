import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

import store from '../reducers';

export const hide = createAction(Constants.PLAYLISTS_HIDE);

export const toggle = createAction(Constants.PLAYLISTS_TOGGLE);

export const loadPlaylists = createAction(
    Constants.PLAYLISTS_LOAD,
    async () => {
        const sonos = SonosService._currentDevice;
        return await sonos.searchMusicLibrary('sonos_playlists');
    }
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
    }
);
