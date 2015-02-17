export default {
    currentZone: null,
    zoneGroups: [],

    coordinator: {
        host: null,
        port: null
    },
    currentTrack: {},
    nextTrack: {},
    volumeControls: {
        master: {
            volume: 0,
            muted: false
        },
        players: {

        }
    },
    positionInfo: null,
    playState: {
        playing: false
    },

    queue: {
        returned: 0,
        total: 0,
        items: []
    },

    browserState: {
        source: null,
        searchType: null,
        headline: 'Select a Music Source',
        items: [
            {
                title: 'Sonos Favourites',
                source: 'favourites'
            },
            {
                title: 'Music Library',
                source: 'library'
            }
        ]
    }
};
