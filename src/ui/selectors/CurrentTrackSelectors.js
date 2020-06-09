export function getNextTrack(state) {
    const { nextTracks, currentHost } = state.sonosService;
    return nextTracks[currentHost] || null;
}

export function getCurrentTrack(state) {
    const { currentTracks, currentHost, albumArtCache } = state.sonosService;
    const track = currentTracks[currentHost];

    if (!track) {
        return null;
    }

    const albumArtURI = track.albumArtURI || albumArtCache[track.uri] || null;

    return {
        ...track,
        albumArtURI,
    };
}
