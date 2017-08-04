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

export const select = createAction(Constants.BROWSER_SELECT_ITEM);

export const playNow = createAction(Constants.BROWSER_PLAY);

export const playNext = createAction(Constants.BROWSER_PLAY_NEXT);

export const addQueue = createAction(Constants.BROWSER_ADD_QUEUE);

export const replaceQueue = createAction(Constants.BROWSER_REPLACE_QUEUE);

export const removeService = createAction(
    Constants.BROWSER_REMOVE_MUSICSERVICE
);
