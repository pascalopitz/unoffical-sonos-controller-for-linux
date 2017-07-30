import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    playing: false,
    isCrossfade: false,
    playMode: 'NORMAL'
};

export default handleActions(
    {
        [Constants.PLAYER_PAUSE]: state => {
            return {
                ...state,
                playing: false
            };
        },

        [Constants.PLAYER_PLAY]: state => {
            return {
                ...state,
                playing: true
            };
        },

        [Constants.OPTIMISTIC_CURRENT_CROSSFADE_MODE_UPDATE]: (
            state,
            action
        ) => {
            return {
                ...state,
                playMode: action.payload
            };
        },

        [Constants.OPTIMISTIC_CURRENT_PLAY_MODE_UPDATE]: (state, action) => {
            return {
                ...state,
                playMode: action.payload
            };
        }
    },
    initialState
);
