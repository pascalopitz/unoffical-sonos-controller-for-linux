import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    currentGroup: null,
    currentHost: null,
    zones: [],
    deviceSearches: {},
    albumArtCache: {},
    currentTracks: {},
    nextTracks: {},
    positionInfos: {},
    mediaInfos: {},
    playStates: {},
    playModes: {},
    crossFadeModes: {},
};

export const REG = /^http:\/\/([\d\.]+)/;

const MONO_MODELS = {
    ZPS1: 'Play:1',
};

const getChannels = (ChannelMapSet) => {
    if (!ChannelMapSet) {
        return null;
    }

    return ChannelMapSet.split(';').reduce((prev, entry) => {
        const [id, channelRaw] = entry.split(':');
        const channels = uniq(channelRaw.split(',')).reduce(
            (p, channel) => ({ ...p, [channel]: id }),
            {},
        );

        return {
            ...prev,
            ...channels,
        };
    }, {});
};

function topologyReducer(state, action) {
    const { groups, attributes, devices } = action.payload;

    const zones = groups
        .map((g) => {
            const { CurrentZonePlayerUUIDsInGroup } = attributes[g.host] || {};

            const ZoneGroupMember = g.ZoneGroupMember.filter((m) => {
                return get(m, 'IsZoneBridge') !== '1';
            })
                .filter(
                    (m) =>
                        !CurrentZonePlayerUUIDsInGroup ||
                        CurrentZonePlayerUUIDsInGroup.indexOf(m.UUID) !== -1,
                )
                .map((m) => {
                    const host = REG.exec(m.Location)?.[1];
                    const device = devices.find((d) => d.host === host);
                    const model = device.model;

                    const isPaired = !!m.ChannelMapSet;
                    const isSurround = !!m.HTSatChanMapSet;
                    const batteryLevel = device.batteryLevel;
                    const isCharging = device.isCharging;

                    // TODO: this is pretty vague. WHat if we have a play1 paired with a subwoofer? Is that possible?
                    const isStereo =
                        isPaired || isSurround || !MONO_MODELS[model];

                    const Channels = getChannels(
                        m.ChannelMapSet || m.HTSatChanMapSet,
                    );

                    const ZoneName = isPaired
                        ? `${m.ZoneName} (${Object.keys(Channels)
                              .map((s) => s.substr(0, 1))
                              .join(' + ')})`
                        : m.ZoneName;

                    return {
                        ...m,
                        host,
                        model,
                        isPaired,
                        isStereo,
                        isSurround,
                        batteryLevel,
                        isCharging,
                        ZoneName,
                        Channels,
                    };
                });

            return {
                ...g,
                ZoneGroupAttributes: attributes[g.host],
                _ZoneGroupMember: g.ZoneGroupMember,
                ZoneGroupMember,
            };
        })
        .filter((g) => g.ZoneGroupMember.length > 0);

    return {
        ...state,
        zones,
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
        [Constants.SONOS_SERVICE_WAKEUP]: () => initialState,

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

            const albumArtCache = {};

            if (track.uri && track.albumArtURI) {
                albumArtCache[track.uri] = track.albumArtURI;
            }

            return {
                ...state,
                albumArtCache: {
                    ...state.albumArtCache,
                    ...albumArtCache,
                },
                currentTracks: {
                    ...state.currentTracks,
                    [host]: track,
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

            return {
                ...state,
                playStates: {
                    ...state.playStates,
                    [host]: playState,
                },
            };
        },

        [Constants.SONOS_SERVICE_MEDIA_INFO_UPDATE]: (state, action) => {
            const { host, ...rest } = action.payload;

            return {
                ...state,
                mediaInfos: {
                    ...state.mediaInfos,
                    [host]: {
                        ...rest,
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

        [Constants.SONOS_SERVICE_CURRENT_CROSSFADE_MODE_UPDATE]:
            crossFadeModeReducer,
        [Constants.OPTIMISTIC_CURRENT_CROSSFADE_MODE_UPDATE]:
            crossFadeModeReducer,

        [Constants.SONOS_SERVICE_CURRENT_PLAY_MODE_UPDATE]: playModeReducer,
        [Constants.OPTIMISTIC_CURRENT_PLAY_MODE_UPDATE]: playModeReducer,

        [Constants.STORE_RESET]: () => initialState,
    },
    initialState,
);
