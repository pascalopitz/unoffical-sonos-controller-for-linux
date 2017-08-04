import _ from 'lodash';

export function getCurrentState(state) {
    return _.last(state.browserList.history);
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
