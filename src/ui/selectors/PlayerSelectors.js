import _ from 'lodash';

export function getPositionInfo(state) {
    const { currentHost, positionInfos } = state.sonosService;
    return positionInfos[currentHost] || {};
}

export function getPlaying(state) {
    const { currentHost, currentTracks } = state.sonosService;
    const currentTrack = currentTracks[currentHost];
    const playing = currentTrack ? currentTrack.isPlaying : false;
    return !!playing;
}

export function getCrossfadeMode(state) {
    const { currentHost, crossFadeModes } = state.sonosService;
    return _.get(crossFadeModes[currentHost], 'CrossfadeMode') === '1';
}

export function getPlayMode(state) {
    const { currentHost, playModes } = state.sonosService;
    return playModes[currentHost];
}
