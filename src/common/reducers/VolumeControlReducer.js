import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    dragging: false,
    expanded: false,
    volume: {},
    muted: {},
};

export default handleActions(
    {
        [Constants.VOLUME_CONTROLS_VOLUME_SET]: (state, action) => {
            const { host, volume } = action.payload;

            return {
                ...state,
                volume: {
                    ...state.volume,
                    [host]: volume,
                },
            };
        },

        [Constants.VOLUME_CONTROLS_MUTE_SET]: (state, action) => {
            const { host, muted } = action.payload;

            return {
                ...state,
                muted: {
                    ...state.muted,
                    [host]: muted,
                },
            };
        },

        [Constants.SONOS_SERVICE_MUTED_UPDATE]: (state, action) => {
            const { host, muted } = action.payload;

            if (state.dragging) {
                return {
                    ...state,
                };
            }

            return {
                ...state,
                muted: {
                    ...state.muted,
                    [host]: muted,
                },
            };
        },

        [Constants.SONOS_SERVICE_VOLUME_UPDATE]: (state, action) => {
            const { host, volume } = action.payload;

            if (state.dragging) {
                return {
                    ...state,
                };
            }

            return {
                ...state,
                volume: {
                    ...state.volume,
                    [host]: volume,
                },
            };
        },

        [Constants.VOLUME_CONTROLS_EXPANDED]: (state, action) => {
            return {
                ...state,
                expanded: action.payload,
            };
        },

        [Constants.VOLUME_CONTROLS_DRAGGING]: (state, action) => {
            return {
                ...state,
                dragging: action.payload,
            };
        },

        [Constants.STORE_RESET]: () => initialState,
    },
    initialState,
);
