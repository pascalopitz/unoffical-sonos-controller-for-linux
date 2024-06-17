import { IP_ADDRESS, LOCAL_PORT } from '../../common/helpers';

export const START_STATE_ITEMS = [
    {
        title: 'Sonos Favourites',
        searchType: 'FV:2',
        albumArtURI: './svg/ic_favorite_48px.svg',
    },
    {
        title: 'Music Library',
        action: 'library',
        albumArtURI: './svg/ic_audiotrack_48px.svg',
    },
    {
        title: 'Sonos Playlists',
        searchType: 'SQ:',
        albumArtURI: './svg/ic_featured_play_list_48px.svg',
    },
    {
        title: 'Line-in',
        action: 'linein',
        albumArtURI: './svg/ic_input_48px.svg',
    },
];

export const BROWSE_AVAILABLE_SERVICES = {
    title: 'Add New Music Services',
    action: 'browseServices',
    albumArtURI: './svg/ic_add_48px.svg',
};

export const START_STATE = {
    source: 'start',
    searchType: null,
    title: 'Select a Music Source',
    items: [...START_STATE_ITEMS],
};

export const LIBRARY_STATE = {
    title: 'Browse Music Library',
    source: 'library',
    items: [
        {
            title: 'Artists',
            searchType: 'A:ARTIST',
        },
        {
            title: 'Albums',
            searchType: 'A:ALBUM',
        },
        {
            title: 'Composers',
            searchType: 'A:COMPOSER',
        },
        {
            title: 'Genres',
            searchType: 'A:GENRE',
        },
        {
            title: 'Tracks',
            searchType: 'A:TRACKS',
        },
        {
            title: 'Playlists',
            searchType: 'A:PLAYLISTS',
        },
        {
            title: 'Folders',
            searchType: 'S:',
        },
    ],
};

export const DEFAULT_SEARCH_MODE = 'artists';
export const LIBRARY_SEARCH_MODES = [
    {
        id: 'artists',
        mappedId: 'A:ALBUMARTIST',
    },
    {
        id: 'albums',
        mappedId: 'A:ALBUM',
    },
    {
        id: 'tracks',
        mappedId: 'A:TRACKS',
    },
    {
        id: 'composers',
        mappedId: 'A:COMPOSER',
    },
    {
        id: 'contributors',
        mappedId: 'A:ARTIST',
    },
    {
        id: 'playlists',
        mappedId: 'A:PLAYLISTS',
    },
    {
        id: 'genres',
        mappedId: 'A:GENRE',
    },
    {
        id: 'radios',
        mappedId: 'R:0',
    },
    {
        id: 'favourites',
        mappedId: 'FV:2',
    },
];
