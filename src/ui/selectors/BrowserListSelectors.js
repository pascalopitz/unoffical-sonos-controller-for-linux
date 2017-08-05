import _ from 'lodash';

export function getCurrentState(state) {
    const lastState = _.last(state.browserList.history);

    if (state.browserList.history.length > 1) {
        return lastState;
    }

    const serviceItems = state.musicServices.active.map(ser => ({
        title: ser.service.Name,
        action: 'service',
        service: ser
    }));

    return {
        ...lastState,
        items: lastState.items.concat(serviceItems)
    };
}

export function getSearching(state) {
    return !!state.browserList.searchTerm;
}

export function getSearchMode(state) {
    return !!state.browserList.searchMode;
}

export function getHistory(state) {
    return state.browserList.history;
}

export function getSearchSources(state) {
    return [];
}
