import _ from 'lodash';

export function getZoneGroups(state) {
    const zones = state.sonosService.zones;
    return _(zones)
        .sortBy('name')
        .groupBy('group')
        .value();
}

export function getCurrentHost(state) {
    return state.sonosService.currentHost;
}

export function getCurrentGroup(state) {
    return state.sonosService.currentGroup;
}

export function getPlayStates(state) {
    return state.sonosService.currentTracks;
}
