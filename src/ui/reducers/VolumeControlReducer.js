import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    dragging: false,
    expanded: false,
    volume: {},
    muted: {}
};

export default handleActions(
    {
        [Constants.VOLUME_CONTROLS_VOLUME_SET]: (state, action) => {
            const { host, volume } = action.payload;

            if (!host) {
                try {
                    throw new Error(action);
                } catch (err) {
                    console.error(err);
                }
                return state;
            }

            return {
                ...state,
                volume: {
                    ...state.volume,
                    [host]: volume
                }
            };
        },

        [Constants.VOLUME_CONTROLS_MUTE_SET]: (state, action) => {
            const { host, muted } = action.payload;

            if (!host) {
                return state;
            }

            return {
                ...state,
                muted: {
                    ...state.muted,
                    [host]: muted
                }
            };
        },

        [Constants.SONOS_SERVICE_VOLUME_UPDATE]: (state, action) => {
            const { host, volume, muted } = action.payload;

            if (state.dragging) {
                return {
                    ...state
                };
            }

            return {
                ...state,
                muted: {
                    ...state.muted,
                    [host]: muted
                },
                volume: {
                    ...state.volume,
                    [host]: volume
                }
            };
        },

        [Constants.VOLUME_CONTROLS_EXPANDED]: (state, action) => {
            return {
                ...state,
                expanded: action.payload
            };
        },

        [Constants.VOLUME_CONTROLS_DRAGGING]: (state, action) => {
            return {
                ...state,
                dragging: action.payload
            };
        }
    },
    initialState
);
