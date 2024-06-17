import map from 'lodash/map';
import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    selected: [],
    visible: false,
    current: null,
};

function resetReducer() {
    return initialState;
}

export default handleActions(
    {
        [Constants.GROUP_MANAGEMENT_SHOW]: (state, action) => {
            return {
                ...state,
                selected: map(action.payload.ZoneGroupMember, (g) => g.UUID),
                currentGroup: action.payload.ID,
                visible: true,
            };
        },

        [Constants.GROUP_MANAGEMENT_TOGGLE]: (state, action) => {
            const uuid = action.payload.UUID;

            const selected =
                state.selected.indexOf(uuid) > -1
                    ? state.selected.filter((i) => i != uuid)
                    : state.selected.concat([uuid]);

            return {
                ...state,
                selected,
            };
        },

        [Constants.GROUP_MANAGEMENT_HIDE]: resetReducer,
        [Constants.GROUP_MANAGEMENT_SAVE]: resetReducer,
        [Constants.STORE_RESET]: () => initialState,
    },
    initialState,
);
