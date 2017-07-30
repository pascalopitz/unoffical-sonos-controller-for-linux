import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    expanded: true
};

export default handleActions(
    {
        [Constants.CURRENT_TRACK_TOGGLE_EXPANDED]: (state, action) => {
            return {
                ...state,
                expanded: !!action.payload
            };
        }
    },
    initialState
);
