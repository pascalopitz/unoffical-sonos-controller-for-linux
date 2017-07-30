import _ from 'lodash';
import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    selected: [],
    visible: false,
    current: null
};

export default handleActions(
    {
        [Constants.GROUP_MANAGEMENT_SHOW]: (state, action) => {
            return {
                ...state,
                selected: _.map(action.payload, g => g.uuid),
                current: action.payload.uuid,
                visible: true
            };
        },

        [Constants.GROUP_MANAGEMENT_HIDE]: state => {
            return {
                ...state,
                visible: false,
                current: null,
                selected: []
            };
        },

        [Constants.GROUP_MANAGEMENT_TOGGLE]: (state, action) => {
            const uuid = action.payload.uuid;

            if (uuid === state.current) {
                return state;
            }

            const selected =
                state.selected.indexOf(uuid) > -1
                    ? state.selected.filter(i => i != uuid)
                    : state.selected.concat([uuid]);

            return {
                ...state,
                selected
            };
        },

        [Constants.GROUP_MANAGEMENT_SAVE]: (state, action) => {
            console.log(action);
            return state;
        }
    },
    initialState
);
