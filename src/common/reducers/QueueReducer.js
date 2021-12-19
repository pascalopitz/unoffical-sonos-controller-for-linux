import includes from 'lodash/includes';
import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    currentHost: null,
    currentGroup: null,
    playerItems: {},
    selected: [],
};

function removalReducer(state, action) {
    const host = state.currentHost;
    const removed = action.payload;

    const items = []
        .concat(state.playerItems[host].items)
        .filter((item) => !includes(removed, item.id));

    const selected = state.selected.filter((id) => !includes(removed, id));

    const newState = {
        ...state,
        selected,
    };

    newState.playerItems[host].items = items;
    return newState;
}

function zoneGroupSelectReducer(state, action) {
    return {
        ...state,
        selected: [],
        currentHost: action.payload.host,
        currentGroup: action.payload.ID,
    };
}

export default handleActions(
    {
        [Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT]: zoneGroupSelectReducer,
        [Constants.ZONE_GROUP_SELECT]: zoneGroupSelectReducer,

        [Constants.SONOS_SERVICE_QUEUE_UPDATE]: (state, action) => {
            if (!action.payload) {
                return state;
            }

            const { result, host } = action.payload;

            return {
                ...state,
                playerItems: {
                    ...state.playerItems,
                    [host]: result,
                },
            };
        },

        [Constants.QUEUE_REMOVE_SELECTED]: removalReducer,
        [Constants.QUEUE_REMOVE]: removalReducer,

        [Constants.QUEUE_REORDER]: (state, action) => {
            const host = state.currentHost;
            const { position, newPosition } = action.payload;

            const items = [].concat(state.playerItems[host].items);

            const slice = items.splice(position - 1, 1);
            items.splice(newPosition - 1, 0, slice[0]);

            const newState = {
                ...state,
            };
            newState.playerItems[host].items = items;

            return newState;
        },

        [Constants.QUEUE_SELECT]: (state, action) => {
            const host = state.currentHost;
            const position = action.payload;
            const trackId = state.playerItems[host].items[position - 1].id;
            const selected = [].concat(state.selected, [trackId]);

            return {
                ...state,
                selected,
            };
        },

        [Constants.QUEUE_DESELECT]: (state, action) => {
            const host = state.currentHost;
            const position = action.payload;
            const trackId = state.playerItems[host].items[position - 1].id;
            const selected = state.selected.filter((i) => i !== trackId);

            return {
                ...state,
                selected,
            };
        },

        [Constants.QUEUE_FLUSH]: (state) => {
            const host = state.currentHost;

            return {
                ...state,
                playerItems: {
                    ...state.playerItems,
                    [host]: null,
                },
            };
        },

        [Constants.STORE_RESET]: () => initialState,
    },
    initialState
);
