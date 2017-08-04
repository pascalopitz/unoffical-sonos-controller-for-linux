import _ from 'lodash';
import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';
import serviceFactory from '../sonos/helpers/ServiceFactory';

async function _getItem(item) {
    if (!item.serviceClient) {
        return item;
    }

    const client = item.serviceClient;
    const serviceType = client._serviceDefinition.ServiceIDEncoded;

    const settingsMatch = _.find(SonosService._accountInfo, {
        Type: String(serviceType)
    });

    if (settingsMatch) {
        const uri = client.getTrackURI(
            item.id,
            client._serviceDefinition.Id,
            settingsMatch.SerialNum
        );
        const token = client.getServiceString(
            serviceType,
            settingsMatch.Username
        );
        const meta = client.encodeItemMetadata(uri, item, token);

        return {
            uri: _.escape(uri),
            metadata: meta
        };
    }

    return client.getMediaURI(item.id).then(uri => {
        return {
            uri: _.escape(uri),
            metadata: client.encodeItemMetadata(uri, item)
        };
    });
}

export const home = createAction(Constants.BROWSER_HOME);

export const back = createAction(Constants.BROWSER_BACK);

export const more = createAction(Constants.BROWSER_SCROLL_RESULT);

export const changeSearchMode = createAction(
    Constants.BROWSER_CHANGE_SEARCH_MODE
);

export const playCurrentAlbum = createAction(Constants.BROWSER_PLAY);

export const select = createAction(
    Constants.BROWSER_SELECT_ITEM,
    async item => {
        const sonos = SonosService._currentDevice;
        let prendinBrowserUpdate;
        const objectId = item.searchType;

        if (item.action && item.action === 'library') {
            return library;
        }

        // if (item.action && item.action === 'linein') {
        //     this._fetchLineIns().then(results => {
        //         const state = _.cloneDeep(item);
        //         state.items = results || [];

        //         Dispatcher.dispatch({
        //             actionType: Constants.BROWSER_SELECT_ITEM,
        //             state: state
        //         });
        //     });
        //     return;
        // }

        // if (item.action && item.action === 'browseServices') {
        //     this._fetchMusicServices().then(results => {
        //         const state = _.cloneDeep(item);
        //         state.items = results || [];

        //         Dispatcher.dispatch({
        //             actionType: Constants.BROWSER_SELECT_ITEM,
        //             state: state
        //         });
        //     });
        //     return;
        // }

        // if (item.action && item.action === 'addService') {
        //     Dispatcher.dispatch({
        //         actionType: Constants.BROWSER_ADD_MUSICSERVICE,
        //         service: new MusicServiceClient(item.data)
        //     });
        //     return;
        // }

        // if (item.action && item.action === 'service') {
        //     const client = new MusicServiceClient(item.service.service);
        //     client.setAuthToken(item.service.authToken.authToken);
        //     client.setKey(item.service.authToken.privateKey);

        //     client.getMetadata('root', 0, 100).then(res => {
        //         const state = {
        //             title: client.name,
        //             serviceClient: client,
        //             items: _.map(res.mediaCollection, i => {
        //                 i.serviceClient = client;
        //                 return i;
        //             })
        //         };

        //         Dispatcher.dispatch({
        //             actionType: Constants.BROWSER_SELECT_ITEM,
        //             state: state
        //         });
        //     });
        //     return;
        // }

        // if (item.serviceClient && item.itemType !== 'track') {
        //     const client = item.serviceClient;

        //     client.getMetadata(item.id, 0, 100).then(res => {
        //         const items = [];

        //         if (res.mediaMetadata) {
        //             if (!_.isArray(res.mediaMetadata)) {
        //                 res.mediaMetadata = [res.mediaMetadata];
        //             }

        //             res.mediaMetadata.forEach(i => {
        //                 i.serviceClient = client;
        //                 items[i.$$position] = i;
        //             });
        //         }

        //         if (res.mediaCollection) {
        //             if (!_.isArray(res.mediaCollection)) {
        //                 res.mediaCollection = [res.mediaCollection];
        //             }

        //             res.mediaCollection.forEach(i => {
        //                 i.serviceClient = client;
        //                 items[i.$$position] = i;
        //             });
        //         }

        //         const state = {
        //             title: item.title,
        //             parent: item,
        //             serviceClient: client,
        //             total: res.total,
        //             items: _.without(items, undefined)
        //         };

        //         Dispatcher.dispatch({
        //             actionType: Constants.BROWSER_SELECT_ITEM,
        //             state: state
        //         });
        //     });

        //     return;
        // }

        // if (item.searchType) {
        //     prendinBrowserUpdate = {
        //         title: item.title,
        //         searchType: item.searchType
        //     };
        // } else {
        //     prendinBrowserUpdate = item;
        // }

        // if (item.class) {
        //     objectId = item.id ? item.id : item.uri.split('#')[1];
        // }

        // sonos.getMusicLibrary(objectId, {}, (err, result) => {
        //     const state = prendinBrowserUpdate;
        //     state.items = result.items;

        //     Dispatcher.dispatch({
        //         actionType: Constants.BROWSER_SELECT_ITEM,
        //         state: state
        //     });
        // });
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
            const res = sonos
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
    Constants.BROWSER_REMOVE_MUSICSERVICE
);
