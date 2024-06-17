import get from 'lodash/get';
import last from 'lodash/last';
import uniq from 'lodash/uniq';
import map from 'lodash/map';

import getServiceLogoUrl from '../helpers/getServiceLogoUrl';

import {
    DEFAULT_SEARCH_MODE,
    LIBRARY_SEARCH_MODES,
    BROWSE_AVAILABLE_SERVICES,
} from '../constants/BrowserListConstants';

export function getCurrentState(state) {
    return last(state.browserList.history);
}

export function getServiceItems(state) {
    const activeServices = state.musicServices.active.map((ser) => ({
        title: ser.service.Name,
        action: 'service',
        service: ser,
    }));

    return [BROWSE_AVAILABLE_SERVICES, ...activeServices];
}

export function getHasSearchTerm(state) {
    return !!state.browserList.searchTerm;
}

export function getSearching(state) {
    const lastItem = last(state.browserList.history) || {};
    return !!state.browserList.searchTerm && !!lastItem.mode;
}

export function getSearchMode(state) {
    const { mode, searchTermMap } = getCurrentState(state) || {};

    return mode || get(searchTermMap, '0.id') || DEFAULT_SEARCH_MODE;
}

export function getAvailableSearchModes(state) {
    const { searchTermMap } = getCurrentState(state) || {};
    return searchTermMap || LIBRARY_SEARCH_MODES;
}

export function getHistory(state) {
    return state.browserList.history;
}

export function getSearchSources(state) {
    return uniq(
        [
            {
                label: 'Music Library',
                client: null,
                logo: './svg/ic_audiotrack_48px.svg',
            },
            {
                label: 'On this device',
                client: {
                    service: {
                        Id: null,
                    },
                },
                logo: './svg/computer-white-24dp.svg',
            },
        ].concat(
            map(state.musicServices.active, (s) => {
                return {
                    logo: getServiceLogoUrl(s.service.Id),
                    label: s.service.Name,
                    client: s,
                };
            })
        )
    );
}
