import _ from 'lodash';

export function getZoneGroups(state) {
    const zones = state.sonosService.zones;
    return _(zones).sortBy('Name').value();
}

export function getCurrentHost(state) {
    return state.sonosService.currentHost;
}

export function getCurrentGroup(state) {
    return state.sonosService.currentGroup;
}

export function getPlayStates(state) {
    return state.sonosService.playStates;
}

export function getCurrentTracks(state) {
    return state.sonosService.currentTracks;
}

export function getCurrentPlayer(state) {
    const { currentHost, deviceSearches } = state.sonosService;
    return deviceSearches[currentHost];
}

export function getFirstPlayer(state) {
    const [first] = Object.values(state.sonosService.deviceSearches);
    return first;
}
