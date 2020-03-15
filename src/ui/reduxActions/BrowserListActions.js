import _ from 'lodash';
import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';
import MusicServiceClient from '../services/MusicServiceClient';

import store from '../reducers';

import {
    LIBRARY_STATE,
    LIBRARY_SEARCH_MODES
} from '../constants/BrowserListConstants';

async function _fetchLineIns() {
    const { deviceSearches } = store.getState().sonosService;

    const promises = _.map(deviceSearches, async sonos => {
        try {
            const result = await sonos.getMusicLibraryAsync('AI:', {});
            const items = result && result.items ? result.items : [];

            if (items.length === 0) {
                return [];
            }

            const data = await sonos.getZoneAttrsAsync();

            items.forEach(i => {
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
    const existingIds = SonosService._musicServices.map(s => s.service.Id); // TODO: fix this

    const services = await sonos.getAvailableServicesAsync();

    let data = _.reject(services, item => {
        return _.includes(existingIds, item.Id);
    });

    data = _.orderBy(data, 'Name');

    return data.map(out => {
        return {
            action: 'addService',
            title: out.Name,
            id: Number(out.Id),
            data: out
        };
    });
}

async function _getItem(item) {
    if (!item.serviceClient) {
        return item;
    }

    const client = item.serviceClient;
    const serviceType = client._serviceDefinition.ServiceIDEncoded;

    if (serviceType) {
        const uri = client.getTrackURI(item, client._serviceDefinition.Id);

        const token = client.getServiceString(serviceType);

        const meta = client.encodeItemMetadata(uri, item, token);

        return {
            uri: _.escape(uri),
            metadata: meta
        };
    }

    const uri = await client.getMediaURI(item.id);

    return {
        uri: _.escape(uri),
        metadata: client.encodeItemMetadata(uri, item)
    };
}

async function _createLibrarySearchPromise(type, term, options = {}) {
    term = escape(term);

    const sonos = SonosService._currentDevice;

    try {
        const result = await sonos.searchMusicLibraryAsync(type, term, options);
        return _.assign(result, {
            type,
            term,
            search: true
        });
    } catch (err) {
        return {
            returned: 0,
            total: 0,
            items: []
        };
    }
}

function _getServiceSearchPromise(client) {
    return async function(type, term, index, count) {
        try {
            const result = await client.search(type, term, index, count);
            return _transformSMAPI(result, client);
        } catch (err) {
            return {
                returned: 0,
                total: 0,
                items: []
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

        res.mediaMetadata.forEach(i => {
            i.serviceClient = client;
            items[i.$$position] = i;
        });
    }

    if (res.mediaCollection) {
        if (!Array.isArray(res.mediaCollection)) {
            res.mediaCollection = [res.mediaCollection];
        }

        res.mediaCollection.forEach(i => {
            i.serviceClient = client;
            items[i.$$position] = i;
        });
    }

    return {
        returned: res.count,
        total: res.total,
        items: items
    };
}
// Actions below

export const home = createAction(Constants.BROWSER_HOME);

export const back = createAction(Constants.BROWSER_BACK);

export const more = createAction(
    Constants.BROWSER_SCROLL_RESULT,
    async prevState => {
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
                start: state.items.length
            };

            if (state.items.length >= state.total) {
                return prevState;
            }

            const client = state.serviceClient;

            if (client) {
                let res;

                if (state.term && state.term.length) {
                    const searchTermMap = await client.getSearchTermMap();
                    const { mappedId } = _.find(searchTermMap, {
                        id: state.mode
                    });

                    res = await _getServiceSearchPromise(client)(
                        mappedId,
                        state.term,
                        state.items.length,
                        state.items.length + 100
                    );
                } else {
                    res = await client.getMetadata(
                        state.parent.id,
                        state.items.length,
                        state.items.length + 100
                    );

                    res = _transformSMAPI(res, client);
                }

                state.items = _.uniq(state.items.concat(res.items));
                return state;
            }

            if (state.term && state.term.length) {
                const { mappedId } = _.find(LIBRARY_SEARCH_MODES, {
                    id: state.mode || LIBRARY_SEARCH_MODES[0].id
                });

                const result = await sonos.searchMusicLibraryAsync(
                    mappedId,
                    state.term,
                    params
                );

                if (!result || !result.items) {
                    return;
                }

                state.items = _.uniq(state.items.concat(result.items));
                return state;
            }

            const result = await sonos.getMusicLibraryAsync(
                state.id || state.searchType,
                params
            );

            if (!result || !result.items) {
                return prevState;
            }

            state.items = _.uniq(state.items.concat(result.items));
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
                    serviceClient
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
                id: mode || LIBRARY_SEARCH_MODES[0].id
            });

            const result = await resolver(mappedId, term);

            items = [...result.items];
            total = result.total;
            return {
                items,
                title,
                term,
                searchTermMap,
                serviceClient,
                mode
            };
        } catch (err) {
            console.error(err);
            return {
                items,
                title,
                term,
                searchTermMap,
                serviceClient,
                mode
            };
        }
    }
);

export const playCurrentAlbum = createAction(Constants.BROWSER_PLAY);

export const select = createAction(
    Constants.BROWSER_SELECT_ITEM,
    async item => {
        const sonos = SonosService._currentDevice;
        let prendinBrowserUpdate;
        let objectId = item.searchType;

        if (item.action && item.action === 'library') {
            return {
                ...LIBRARY_STATE
            };
        }

        if (item.action && item.action === 'linein') {
            const results = await _fetchLineIns();
            const state = _.cloneDeep(item);
            state.items = results || [];
            return state;
        }

        if (item.action && item.action === 'browseServices') {
            const results = await _fetchMusicServices();
            const state = _.cloneDeep(item);
            state.items = results || [];
            return state;
        }

        if (item.action && item.action === 'service') {
            const client = new MusicServiceClient(item.service.service);
            client.setAuthToken(item.service.authToken.authToken);
            client.setKey(item.service.authToken.privateKey);

            const res = await client.getMetadata('root', 0, 100);
            const searchTermMap = await client.getSearchTermMap();

            const state = {
                title: client.name,
                serviceClient: client,
                searchTermMap: searchTermMap,
                items: _.map(res.mediaCollection, i => {
                    i.serviceClient = client;
                    return i;
                })
            };

            return state;
        }

        const { searchTermMap, term } = _.last(
            store.getState().browserList.history
        );

        if (item.serviceClient && item.itemType !== 'track') {
            const client = item.serviceClient;

            const res = await client.getMetadata(item.id, 0, 100);
            const items = [];

            if (res.mediaMetadata) {
                if (!_.isArray(res.mediaMetadata)) {
                    res.mediaMetadata = [res.mediaMetadata];
                }

                res.mediaMetadata.forEach(i => {
                    i.serviceClient = client;
                    items[i.$$position] = i;
                });
            }

            if (res.mediaCollection) {
                if (!_.isArray(res.mediaCollection)) {
                    res.mediaCollection = [res.mediaCollection];
                }

                res.mediaCollection.forEach(i => {
                    i.serviceClient = client;
                    items[i.$$position] = i;
                });
            }

            return {
                title: item.title,
                parent: item,
                term: term,
                searchTermMap: searchTermMap,
                serviceClient: client,
                total: res.total,
                items: _.without(items, undefined)
            };
        }

        if (item.searchType || term) {
            prendinBrowserUpdate = {
                title: item.title,
                term: term,
                searchTermMap: searchTermMap,
                searchType: item.searchType
            };
        } else {
            prendinBrowserUpdate = item;
        }

        if (item.class) {
            objectId = item.id ? item.id : item.uri.split('#')[1];
        }

        try {
            const result = await sonos.getMusicLibraryAsync(objectId, {});
            const state = prendinBrowserUpdate;
            state.items = result.items;

            return state;
        } catch (e) {
            console.error(e);
        }
    }
);

export const playNow = createAction(
    Constants.BROWSER_PLAY,
    async eventTarget => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);

        if (
            item.metadata &&
            item.metadataRaw &&
            item.metadata.class === 'object.item.audioItem.audioBroadcast'
        ) {
            await sonos.playAsync({
                uri: item.uri,
                metadata: item.metadataRaw
            });
        } else if (item.class && item.class === 'object.item.audioItem') {
            await sonos.playAsync(item.uri);
        } else {
            const res = await sonos
                .getMusicLibraryAsync('queue', { total: 0 })
                .catch(() => null);

            let pos = 1;
            if (res.total) {
                pos = Number(res.total) + 1;
            }

            await sonos.queueAsync(item);
            await sonos.gotoAsync(pos);
            await sonos.playAsync();
        }

        SonosService.queryState(sonos);
    }
);

export const playNext = createAction(
    Constants.BROWSER_PLAY_NEXT,
    async eventTarget => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);
        const info = await sonos.getPositionInfoAsync();
        const pos = Number(info.Track) + 1;
        await sonos.queueAsync(item, pos);

        SonosService.queryState(sonos);
    }
);

export const addQueue = createAction(
    Constants.BROWSER_ADD_QUEUE,
    async eventTarget => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);
        await sonos.queueAsync(item);

        SonosService.queryState(sonos);
    }
);

export const replaceQueue = createAction(
    Constants.BROWSER_REPLACE_QUEUE,
    async eventTarget => {
        const sonos = SonosService._currentDevice; // TODO: fix this

        const item = await _getItem(eventTarget);
        await sonos.flushAsync();
        await sonos.queueAsync(item);
        await sonos.playAsync();

        SonosService.queryState(sonos);
    }
);

export const removeService = createAction(
    Constants.BROWSER_REMOVE_MUSICSERVICE,
    async client => {
        await SonosService.removeMusicService(client.service);
        return client;
    }
);

export const addService = createAction(Constants.BROWSER_ADD_MUSICSERVICE);
