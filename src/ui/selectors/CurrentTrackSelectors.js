export function getNextTrack(state) {
    const { nextTracks, currentHost } = state.sonosService;
    return nextTracks[currentHost] ? nextTracks[currentHost].trackInfo : null;
}

export function getCurrentTrack(state) {
    const { currentTracks, currentHost } = state.sonosService;
    return currentTracks[currentHost]
        ? currentTracks[currentHost].trackInfo
        : null;
}
