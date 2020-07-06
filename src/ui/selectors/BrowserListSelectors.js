import _ from 'lodash';
import getServiceLogoUrl from '../helpers/getServiceLogoUrl';

import {
    DEFAULT_SEARCH_MODE,
    LIBRARY_SEARCH_MODES,
    ON_DEVICE_SERVICE,
    BROWSE_AVAILABLE_SERVICES,
} from '../constants/BrowserListConstants';

export function getCurrentState(state) {
    return _.last(state.browserList.history);
}

export function getServiceItems(state) {
    const activeServices = state.musicServices.active.map((ser) => ({
        title: ser.service.Name,
        action: 'service',
        service: ser,
    }));

    const additional = JSON.parse(
        window.localStorage.localMusicEnabled || 'false'
    )
        ? [ON_DEVICE_SERVICE, BROWSE_AVAILABLE_SERVICES]
        : [BROWSE_AVAILABLE_SERVICES];

    return [...additional, ...activeServices];
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
