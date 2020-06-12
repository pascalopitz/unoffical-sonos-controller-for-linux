import _ from 'lodash';

import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    visible: false,
    host: null,
    eqState: {},
};

export default handleActions(
    {
        [Constants.SONOS_SERVICE_RENDERING_CONTROL_UPDATE]: (state, action) => {
            const { host, update } = action.payload;

            const hostState = state.eqState[host] || {
                bass: 0,
                treble: 0,
                loudness: 0,
                balance: 0,
            };

            const bass = parseInt(_.get(update, 'Bass.val') || hostState.bass);
            const treble = parseInt(
                _.get(update, 'Treble.val') || hostState.treble
            );

            const loudness = parseInt(
                _.get(update, 'Loudness.val') || hostState.loudness
            );

            let balance = hostState.balance;
            const volumeUpdate = _.get(update, 'Volume');

            if (volumeUpdate) {
                const LF = parseInt(
                    volumeUpdate.find((u) => u.channel === 'LF').val
                );
                const RF = parseInt(
                    volumeUpdate.find((u) => u.channel === 'RF').val
                );

                balance = LF - RF;
            }

            return {
                ...state,
                eqState: {
                    ...state.eqState,
                    [host]: {
                        ...state.eqState[host],
                        treble,
                        bass,
                        loudness,
                        balance,
                    },
                },
            };
        },

        [Constants.EQ_SELECT]: (state, action) => {
            return {
                ...state,
                host: action.payload,
            };
        },

        [Constants.EQ_SET_VALUE]: (state, action) => {
            const { payload } = action;
            const { host, name, value } = payload;

            return {
                ...state,
                eqState: {
                    ...state.eqState,
                    [host]: {
                        ...state.eqState[host],
                        [name]: value,
                    },
                },
            };
        },

        [Constants.EQ_LOAD]: (state, action) => {
            const { payload } = action;

            return {
                ...state,
                eqState: {
                    ...state.eqState,
                    [payload.host]: { ...payload },
                },
            };
        },

        [Constants.EQ_HIDE]: (state) => {
            return {
                ...state,
                visible: false,
            };
        },

        [Constants.EQ_SHOW]: (state) => {
            return {
                ...state,
                visible: true,
            };
        },
    },
    initialState
);
