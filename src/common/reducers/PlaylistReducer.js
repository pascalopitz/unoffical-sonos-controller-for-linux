import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    mode: null,
    visible: false,
    item: null,
    playlists: [],
    selected: [],
    items: [],
};

export default handleActions(
    {
        [Constants.QUEUE_SAVE]: (state, action) => {
            const items = action.payload;

            return {
                ...state,
                mode: 'save',
                items,
                visible: true,
            };
        },

        [Constants.BROWSER_ADD_TO_PLAYLIST]: (state, action) => {
            const item = action.payload;

            return {
                ...state,
                mode: 'add',
                item,
                visible: true,
            };
        },

        [Constants.BROWSER_EDIT_PLAYLIST]: (state, action) => {
            const item = action.payload;

            return {
                ...state,
                mode: 'edit',
                item,
                visible: true,
            };
        },

        [Constants.PLAYLISTS_HIDE]: (state) => {
            return {
                ...state,
                updateID: null,
                item: null,
                visible: false,
                mode: null,
                selected: [],
            };
        },

        [Constants.PLAYLISTS_LOAD]: (state, action) => {
            const {
                payload: { items },
            } = action;

            return {
                ...state,
                playlists: [...(items || [])],
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

        [Constants.PLAYLISTS_ITEMS_LOAD]: (state, action) => {
            return {
                ...state,
                updateID: action.payload.updateID,
                items: [...action.payload.items],
            };
        },

        [Constants.PLAYLISTS_DELETE_ITEM]: (state, action) => {
            return {
                ...state,
                updateID: action.payload.NewUpdateID,
            };
        },

        [Constants.PLAYLISTS_MOVE_ITEM]: (state, action) => {
            return {
                ...state,
                updateID: action.payload.NewUpdateID,
            };
        },

        [Constants.STORE_RESET]: () => initialState,
    },
    initialState
);
