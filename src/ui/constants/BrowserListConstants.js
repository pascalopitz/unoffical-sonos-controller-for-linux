export const START_STATE_ITEMS = [
    {
        title: 'Sonos Favourites',
        searchType: 'FV:2',
        albumArtURI: './svg/ic_favorite_48px.svg'
    },
    {
        title: 'Music Library',
        action: 'library',
        albumArtURI: './svg/ic_audiotrack_48px.svg'
    },
    {
        title: 'Sonos Playlists',
        searchType: 'SQ:',
        albumArtURI: './svg/ic_featured_play_list_48px.svg'
    },
    {
        title: 'Line-in',
        action: 'linein',
        albumArtURI: './svg/ic_input_48px.svg'
    },
    {
        title: 'Add New Music Services',
        action: 'browseServices',
        albumArtURI: './svg/ic_add_48px.svg'
    }
];

export const START_STATE = {
    source: 'start',
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

export const DEFAULT_SEARCH_MODE = 'artists';
