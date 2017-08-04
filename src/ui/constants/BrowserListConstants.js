export const START_STATE_ITEMS = [
    {
        title: 'Sonos Favourites',
        searchType: 'FV:2'
    },
    {
        title: 'Music Library',
        action: 'library'
    },
    {
        title: 'Sonos Playlists',
        searchType: 'SQ:'
    },
    {
        title: 'Line-in',
        action: 'linein'
    },
    {
        title: 'Add New Music Services',
        action: 'browseServices'
    }
];

export const START_STATE = {
    source: null,
    searchType: null,
    title: 'Select a Music Source',
    items: [...START_STATE_ITEMS]
};

export const LIBRARY_STATE = {
    title: 'Browse Music Library',
    source: 'library',
    items: [
        {
            title: 'Artists',
            searchType: 'A:ARTIST'
        },
        {
            title: 'Albums',
            searchType: 'A:ALBUM'
        },
        {
            title: 'Composers',
            searchType: 'A:COMPOSER'
        },
        {
            title: 'Genres',
            searchType: 'A:GENRE'
        },
        {
            title: 'Tracks',
            searchType: 'A:TRACKS'
        },
        {
            title: 'Playlists',
            searchType: 'A:PLAYLISTS'
        },
        {
            title: 'Folders',
            searchType: 'S:'
        }
    ]
};

const DEFAULT_SEARCH_MODE = 'artists';
