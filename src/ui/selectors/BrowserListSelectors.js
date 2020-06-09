import _ from 'lodash';
import getServiceLogoUrl from '../helpers/getServiceLogoUrl';

import {
    DEFAULT_SEARCH_MODE,
    LIBRARY_SEARCH_MODES,
} from '../constants/BrowserListConstants';

export function getCurrentState(state) {
    return _.last(state.browserList.history);
}

export function getServiceItems(state) {
    return state.musicServices.active.map((ser) => ({
        title: ser.service.Name,
        action: 'service',
        service: ser,
    }));
}

export function getSearching(state) {
    const lastItem = _.last(state.browserList.history) || {};
    return !!state.browserList.searchTerm && !!lastItem.mode;
}

export function getSearchMode(state) {
    const { mode, searchTermMap } = getCurrentState(state) || {};

    return mode || _.get(searchTermMap, '0.id') || DEFAULT_SEARCH_MODE;
}

export function getAvailableSearchModes(state) {
    return getCurrentState(state).searchTermMap || LIBRARY_SEARCH_MODES;
}

export function getHistory(state) {
    return state.browserList.history;
}

export function getSearchSources(state) {
    return _.uniq(
        [
            {
                label: 'Music Library',
                client: null,
                logo: './svg/ic_audiotrack_48px.svg',
            },
        ].concat(
            _.map(state.musicServices.active, (s) => {
                return {
                    logo: getServiceLogoUrl(s.service.Id),
                    label: s.service.Name,
                    client: s,
                };
            })
        )
    );
}
