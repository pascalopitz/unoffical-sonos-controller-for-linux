import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    currentGroup: null,
    currentHost: null,
    zones: [],
    deviceSearches: {},
    currentTracks: {},
    nextTracks: {},
    positionInfos: {},
    playStates: {},
    playModes: {},
    crossFadeModes: {},
};

export const REG = /^http:\/\/([\d\.]+)/;

function topologyReducer(state, action) {
    return {
        ...state,
        zones: action.payload,
    };
}

function zoneGroupSelectReducer(state, action) {
    return {
        ...state,
        currentHost: action.payload.host,
        currentGroup: action.payload.ID,
    };
}

function playModeReducer(state, action) {
    const { host, mode } = action.payload;

    return {
        ...state,
        playModes: {
            ...state.playModes,
            [host]: mode,
        },
    };
}

function crossFadeModeReducer(state, action) {
    const { host, mode } = action.payload;

    return {
        ...state,
        crossFadeModes: {
            ...state.crossFadeModes,
            [host]: mode,
        },
    };
}

export default handleActions(
    {
        [Constants.SONOS_SERVICE_TOPOLOGY_EVENT]: topologyReducer,
        [Constants.SONOS_SERVICE_TOPOLOGY_UPDATE]: topologyReducer,

        [Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT]: zoneGroupSelectReducer,
        [Constants.ZONE_GROUP_SELECT]: zoneGroupSelectReducer,

        [Constants.SONOS_SERVICE_DEVICE_SEARCH_RESULT]: (state, action) => {
            return {
                ...state,
                deviceSearches: {
                    ...state.deviceSearches,
                    [action.payload.host]: action.payload,
                },
            };
        },

        [Constants.QUEUE_FLUSH]: (state) => {
            const host = state.currentHost;

            return {
                ...state,
                currentTracks: {
                    ...state.currentTracks,
                    [host]: null,
                },
                nextTracks: {
                    ...state.nextTracks,
                    [host]: null,
                },
            };
        },

        [Constants.SONOS_SERVICE_ZONEGROUP_TRACK_UPDATE]: (state, action) => {
            const { host, track } = action.payload;

            return {
                ...state,
                currentTracks: {
                    ...state.currentTracks,
                    [host]: {
                        host,
                        trackInfo: {
                            title: track.title,
                            albumArtURI: track.albumArtURI,
                        },
                    },
                },
            };
        },

        [Constants.SONOS_SERVICE_NEXT_TRACK_UPDATE]: (state, action) => {
            const { track, host } = action.payload;

            return {
                ...state,
                nextTracks: {
                    ...state.nextTracks,
                    [host]: track,
                },
            };
        },

        [Constants.SONOS_SERVICE_QUEUE_UPDATE]: (state) => state,
        [Constants.SONOS_SERVICE_VOLUME_UPDATE]: (state) => state,
        [Constants.SONOS_SERVICE_MUTED_UPDATE]: (state) => state,

        [Constants.SONOS_SERVICE_PLAYSTATE_UPDATE]: (state, action) => {
            const { host, playState } = action.payload;

            if (playState === 'transitioning') {
                return {
                    ...state,
                };
            }

            const isPlaying = playState === 'playing';

            return {
                ...state,
                currentTracks: {
                    ...state.currentTracks,
                    [host]: {
                        ...state.currentTracks[host],
                        isPlaying,
                    },
                },
            };
        },

        [Constants.SONOS_SERVICE_POSITION_INFO_UPDATE]: (state, action) => {
            const { host, info } = action.payload;

            return {
                ...state,
                positionInfos: {
                    ...state.positionInfos,
                    [host]: info,
                },
            };
        },

        [Constants.SONOS_SERVICE_CURRENT_CROSSFADE_MODE_UPDATE]: crossFadeModeReducer,
        [Constants.OPTIMISTIC_CURRENT_CROSSFADE_MODE_UPDATE]: crossFadeModeReducer,

        [Constants.SONOS_SERVICE_CURRENT_PLAY_MODE_UPDATE]: playModeReducer,
        [Constants.OPTIMISTIC_CURRENT_PLAY_MODE_UPDATE]: playModeReducer,
    },
    initialState
);
