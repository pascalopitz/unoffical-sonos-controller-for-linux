import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    playerItems: {},
    items: [],
    selected: []
};

export default handleActions(
    {
        [Constants.SONOS_SERVICE_QUEUE_UPDATE]: (state, action) => {
            if (!action.payload) {
                return state;
            }

            const { result, host } = action.payload;

            return {
                ...state,
                playerItems: {
                    ...state.playerItems,
                    [host]: result
                }
            };
        },

        [Constants.QUEUE_REORDER]: state => state,

        [Constants.QUEUE_SELECT]: (state, action) => {
            const selected = [].concat(state.selected, [action.payload]);

            return {
                ...state,
                selected
            };
        },
        [Constants.QUEUE_DESELECT]: (state, action) => {
            const selected = state.selected.filter(i => i !== action.payload);

            return {
                ...state,
                selected
            };
        },

        [Constants.ZONE_GROUP_SELECT]: state => {
            return {
                ...state,
                selected: []
            };
        },

        [Constants.QUEUE_FLUSH]: (state, action) => {
            const host = action.getState().sonosService.currentHost;

            return {
                ...state,
                playerItems: {
                    ...state.playerItems,
                    [host]: null
                }
            };
        }
    },
    initialState
);
