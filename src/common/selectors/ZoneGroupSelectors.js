import sortBy from 'lodash/sortBy';

export function getZoneGroups(state) {
    const zones = state.sonosService.zones;
    return sortBy(zones, 'Name');
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
