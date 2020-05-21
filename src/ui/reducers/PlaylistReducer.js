import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    visible: false,
    item: null,
    playlists: [],
    selected: [],
};

export default handleActions(
    {
        [Constants.BROWSER_ADD_TO_PLAYLIST]: (state, action) => {
            const item = action.payload;

            return {
                ...state,
                item,
                visible: true,
            };
        },

        [Constants.PLAYLISTS_HIDE]: (state) => {
            return {
                ...state,
                item: null,
                visible: false,
            };
        },

        [Constants.PLAYLISTS_LOAD]: (state, action) => {
            return {
                ...state,
                playlists: [...action.payload.items],
            };
        },

        [Constants.PLAYLISTS_TOGGLE]: (state, action) => {
            const id = action.payload.id;

            const selected = state.selected.indexOf(id) > -1 ? [] : [id];

            return {
                ...state,
                selected,
            };
        },
    },
    initialState
);
