import _ from 'lodash';

import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';
import MusicServiceClient from '../services/MusicServiceClient';

import store from '../reducers';

import { getCurrentTrack } from '../selectors/CurrentTrackSelectors';

import {
    LIBRARY_STATE,
    LIBRARY_SEARCH_MODES,
} from '../constants/BrowserListConstants';

import { loadPlaylists, loadPlaylistItems } from './PlaylistActions';

async function _fetchLineIns() {
    const { deviceSearches } = store.getState().sonosService;

    const promises = _.map(deviceSearches, async (sonos) => {
        try {
            const result = await sonos.queryMusicLibrary('AI:', null, {});
            const items = result && result.items ? result.items : [];

            if (items.length === 0) {
                return [];
            }

            const data = await sonos.getZoneAttrs();

            items.forEach((i) => {
                i.title = i.title + ': ' + data.CurrentZoneName;
            });

            return items;
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    const arr = await Promise.all(promises);
    return _.flatten(arr);
}

async function _fetchMusicServices() {
    const sonos = SonosService._currentDevice; // TODO: fix this
    const existingIds = SonosService._musicServices.map((s) => s.service.Id); // TODO: fix this

    const services = await sonos.getAvailableServices();

    let data = _.reject(services, (item) => {
        return _.includes(existingIds, item.Id);
    });

    data = _.orderBy(data, 'Name');

    return data.map((out) => {
        return {
            action: 'addService',
            title: out.Name,
            id: Number(out.Id),
            data: out,
        };
    });
}

export async function _getItem(item) {
    if (!item.serviceClient) {
        return item;
    }

    const client = item.serviceClient;
    const serviceType = client._serviceDefinition.ServiceIDEncoded;

    if (serviceType) {
        const uri = client.getTrackURI(item, client._serviceDefinition.Id);
        const meta = client.encodeItemMetadata(uri, item);

        return {
            uri,
            ...meta,
        };
    }

    const uri = await client.getMediaURI(item.id);
    const meta = client.encodeItemMetadata(uri, item);

    return {
        uri,
        ...meta,
    };
}

async function _createLibrarySearchPromise(type, term, options = {}) {
    const sonos = SonosService._currentDevice;
    term = escape(term);

    try {
        const result = await sonos.queryMusicLibrary(type, term, options);
        return _.assign(result, {
            type,
            term,
            search: true,
        });
    } catch (err) {
        return {
            returned: 0,
            total: 0,
            items: [],
        };
    }
}

function _getServiceSearchPromise(client) {
    return async function (type, term, index, count) {
        try {
            const result = await client.search(type, term, index, count);
            return _transformSMAPI(result, client);
        } catch (err) {
            return {
                returned: 0,
                total: 0,
                items: [],
            };
        }
    };
}

function _transformSMAPI(res, client) {
    const items = [];

    if (res.mediaMetadata) {
        if (!Array.isArray(res.mediaMetadata)) {
            res.mediaMetadata = [res.mediaMetadata];
        }

        res.mediaMetadata.forEach((i) => {
            i.serviceClient = client;
            items.push(i);
        });
    }

    if (res.mediaCollection) {
        if (!Array.isArray(res.mediaCollection)) {
            res.mediaCollection = [res.mediaCollection];
        }

        res.mediaCollection.forEach((i) => {
            i.serviceClient = client;
            items.push(i);
        });
    }

    return {
        returned: res.count,
        total: res.total,
        items: items,
    };
}
// Actions below

export const home = createAction(Constants.BROWSER_HOME);

export const back = createAction(Constants.BROWSER_BACK);

export const scroll = createAction(Constants.BROWSER_SCROLL_POSITION);

export const more = createAction(
    Constants.BROWSER_SCROLL_RESULT,
    async (prevState) => {
        try {
            if (
                prevState.action === 'linein' ||
                prevState.action === 'browseServices' ||
                prevState.source === 'start'
            ) {
                return prevState;
            }

            const state = _.cloneDeep(prevState);

            const sonos = SonosService._currentDevice; // TODO: fix this
            const params = {
                start: state.items.length,
            };

            if (state.total && state.items.length >= state.total) {
                return prevState;
            }

            const client = state.serviceClient;

            if (client) {
                let res;

                if (state.term && state.term.length) {
                    const searchTermMap = await client.getSearchTermMap();
                    const { mappedId } = _.find(searchTermMap, {
                        id: state.mode,
                    });

                    res = await _getServiceSearchPromise(client)(
                        mappedId,
                        state.term,
                        state.items.length,
                        state.items.length + 100
                    );
                } else {
                    res = await client.getMetadata(
                        _.get(state, 'parent.id'),
                        state.items.length,
                        state.items.length + 100
                    );

                    res = _transformSMAPI(res, client);
                }

                state.items = _.compact(_.uniq([...state.items, ...res.items]));
                return state;
            }

            if (state.mode && state.term && state.term.length) {
                const result = await sonos.queryMusicLibrary(
                    state.mode,
                    state.term,
                    params
                );

                if (!result || !result.items) {
                    return;
                }

                state.items = _.compact(
                    _.uniq([...state.items, ...result.items])
                );
                return state;
            }

            const result = await sonos.queryMusicLibrary(
                state.id || state.searchType,
                null,
                params
            );

            if (!result || !result.items) {
                return prevState;
            }

            state.items = _.compact(_.uniq([...state.items, ...result.items]));
            return state;
        } catch (err) {
            console.error(err);
            return {};
        }
    }
);

export const exitSearch = createAction(Constants.BROWSER_SEARCH_EXIT);

export const search = createAction(
    Constants.BROWSER_SEARCH,
    async (term, mode) => {
        const currentState = _.last(store.getState().browserList.history);
        const { serviceClient, searchTermMap } = currentState;
        let items = [];
        let total = 0;
        let title = 'Search';

        try {
            if (!term || !term.length) {
                return {
                    items,
                    total,
                    title,
                    term,
                    searchTermMap,
                    serviceClient,
                };
            }

            let resolver;
            title = `Search ${term}`;

            if (currentState.serviceClient) {
                const client = currentState.serviceClient;
                resolver = _getServiceSearchPromise(client);
            } else {
                resolver = _createLibrarySearchPromise;
            }

            const { mappedId } = _.find(searchTermMap || LIBRARY_SEARCH_MODES, {
                id: mode || LIBRARY_SEARCH_MODES[0].id,
            });

            const result = await resolver(mappedId, term);

            items = _.compact(_.uniq([...(result.items || [])]));
            total = result.total;
            return {
                items,
                title,
                term,
                searchTermMap,
                serviceClient,
                mode,
            };
        } catch (err) {
            console.error(err);
            return {
                items,
                title,
                term,
                searchTermMap,
                serviceClient,
                mode,
            };
        }
    }
);

export const playCurrentAlbum = createAction(Constants.BROWSER_PLAY);

const selectLineIns = async (item) => {
    const results = await _fetchLineIns();
    const state = _.cloneDeep(item);
    state.items = results || [];
    return state;
};

const selectBrowseServices = async (item) => {
    const results = await _fetchMusicServices();
    const state = _.cloneDeep(item);
    state.items = results || [];
    return state;
};

const selectService = async (item) => {
    const client = new MusicServiceClient(
        item.service.service,
        item.service.authToken || {}
    );

    const res = await client.getMetadata('root', 0, 100);
    const searchTermMap = await client.getSearchTermMap();

    const items = [];

    if (res.mediaMetadata) {
        if (!_.isArray(res.mediaMetadata)) {
            res.mediaMetadata = [res.mediaMetadata];
        }

        res.mediaMetadata.forEach((i) => {
            i.serviceClient = client;
            items.push(i);
        });
    }

    if (res.mediaCollection) {
        if (!_.isArray(res.mediaCollection)) {
            res.mediaCollection = [res.mediaCollection];
        }

        res.mediaCollection.forEach((i) => {
            i.serviceClient = client;
            items.push(i);
        });
    }

    const state = {
        title: client.name,
        serviceClient: client,
        searchTermMap: searchTermMap,
        items,
    };

    return state;
};

const selectSonosPlaylist = async (item) => {
    const sonos = SonosService._currentDevice;

    const {
        _raw: { id },
    } = item;

    const result = await sonos.queryMusicLibrary(id);

    const state = _.cloneDeep(item);
    state.items = result.items || [];
    state.total = result.total;
    state.updateID = result.updateID;
    state.id = id;
    return state;
};

const selectServiceMediaCollectionItem = async (item) => {
    const { searchTermMap, term } = _.last(
        store.getState().browserList.history
    );

    const client = item.serviceClient;

    const res = await client.getMetadata(item.id, 0, 100);
    const items = [];

    if (res.mediaMetadata) {
        if (!_.isArray(res.mediaMetadata)) {
            res.mediaMetadata = [res.mediaMetadata];
        }

        res.mediaMetadata.forEach((i) => {
            i.serviceClient = client;
            items.push(i);
        });
    }

    if (res.mediaCollection) {
        if (!_.isArray(res.mediaCollection)) {
            res.mediaCollection = [res.mediaCollection];
        }

        res.mediaCollection.forEach((i) => {
            i.serviceClient = client;
            items.push(i);
        });
    }

    return {
        title: item.title,
        parent: item,
        term: term,
        searchTermMap: searchTermMap,
        serviceClient: client,
        total: res.total,
        items: _.compact(_.uniq(items)),
    };
};

export const select = createAction(
    Constants.BROWSER_SELECT_ITEM,
    async (item) => {
        const sonos = SonosService._currentDevice;
        let prendinBrowserUpdate;
        let objectId = item.searchType;

        if (item.action && item.action === 'library') {
            return {
                ...LIBRARY_STATE,
            };
        }

        if (item.action && item.action === 'linein') {
            return await selectLineIns(item);
        }

        if (item.action && item.action === 'browseServices') {
            return await selectBrowseServices(item);
        }

        if (item.action && item.action === 'service') {
            return await selectService(item);
        }

        if (item.class === 'object.container.playlistContainer') {
            return await selectSonosPlaylist(item);
        }

        const { searchTermMap, term } = _.last(
            store.getState().browserList.history
        );

        if (
            item.serviceClient &&
            item.itemType !== 'track' &&
            item.itemType !== 'stream'
        ) {
            return await selectServiceMediaCollectionItem(item);
        }

        if (item.searchType || term) {
            prendinBrowserUpdate = {
                title: item.title,
                term: term,
                searchTermMap: searchTermMap,
                searchType: item.searchType,
            };
        } else {
            prendinBrowserUpdate = item;
        }

        if (item.uri && item.uri.indexOf('#') > -1) {
            objectId = item.uri.split('#')[1];
        } else if (item.uri) {
            objectId = item.uri;
        }

        try {
            const result = await sonos.queryMusicLibrary(objectId, null, {});
            const state = prendinBrowserUpdate;
            state.id = objectId;
            state.items = result.items;

            return state;
        } catch (e) {
            console.error(e);
        }
    }
);

export const playNow = createAction(
    Constants.BROWSER_PLAY,
    async (eventTarget) => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);

        if (
            item.metadata &&
            item.class.indexOf('object.item.audioItem.audioBroadcast') !== -1
        ) {
            await sonos.setAVTransportURI(item);
        } else if (item.class && item.class === 'object.item.audioItem') {
            await sonos.play(item.uri);
        } else {
            await sonos.play(item);
        }

        SonosService.queryState(sonos);
    }
);

export const playNext = createAction(
    Constants.BROWSER_PLAY_NEXT,
    async (eventTarget) => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);
        const currentTrack = getCurrentTrack(store.getState());
        const pos = Number(currentTrack.queuePosition) + 1;
        await sonos.queue(item, pos);

        SonosService.queryState(sonos);
    }
);

export const addQueue = createAction(
    Constants.BROWSER_ADD_QUEUE,
    async (eventTarget) => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);
        await sonos.queue(item);

        SonosService.queryState(sonos);
    }
);

export const replaceQueue = createAction(
    Constants.BROWSER_REPLACE_QUEUE,
    async (eventTarget) => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);
        await sonos.flush();
        await sonos.queue(item);
        await sonos.play();

        SonosService.queryState(sonos);
    }
);

export const removeService = createAction(
    Constants.BROWSER_REMOVE_MUSICSERVICE,
    async (client) => {
        await SonosService.removeMusicService(client.service);
        return client;
    }
);

export const addService = createAction(Constants.BROWSER_ADD_MUSICSERVICE);

export const addToPlaylist = createAction(
    Constants.BROWSER_ADD_TO_PLAYLIST,
    async (item) => {
        await store.dispatch(loadPlaylists());
        return item;
    }
);

export const editPlaylist = createAction(
    Constants.BROWSER_EDIT_PLAYLIST,
    async (item) => {
        await store.dispatch(loadPlaylists());
        await store.dispatch(loadPlaylistItems(item._raw.id));
        return item;
    }
);

export const deletePlaylist = createAction(
    Constants.BROWSER_DELETE_PLAYLIST,
    async (item) => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        await sonos.deletePlaylist(item.id);

        return item;
    }
);

export const deleteFavourite = createAction(
    Constants.BROWSER_DELETE_FAVOURITE,
    async (item) => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const contentDirectoryService = sonos.contentDirectoryService();
        await contentDirectoryService.DestroyObject({ ObjectID: item._raw.id });

        return item;
    }
);
