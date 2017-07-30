export function getExpanded(state) {
    return !state.currentTrack.expanded;
}

export function getTracks(state) {
    const entry = state.queue.playerItems[state.sonosService.currentHost];
    return entry ? entry.items : [];
}

export function getPositionInfo(state) {
    const entry =
        state.sonosService.positionInfos[state.sonosService.currentHost];
    return entry ? Number(entry.Track) : null;
}
