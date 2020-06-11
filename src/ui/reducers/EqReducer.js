import { handleActions } from 'redux-actions';
import Constants from '../constants';

const initialState = {
    visible: false,
    host: null,
    eqState: {},
};

export default handleActions(
    {
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
