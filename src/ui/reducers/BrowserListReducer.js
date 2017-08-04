import _ from 'lodash';
import { handleActions } from 'redux-actions';
import Constants from '../constants';

import {
    START_STATE,
    DEFAULT_SEARCH_MODE
} from '../constants/BrowserListConstants';

const initialState = {
    source: null,
    searchTerm: null,
    searchMode: DEFAULT_SEARCH_MODE,
    history: [
        {
            ...START_STATE
        }
    ]
};

export default handleActions(
    {
        [Constants.BROWSER_SELECT_ITEM]: (state, action) => {
            let { history } = state;
            history = history.concat(action.payload);

            return {
                ...state,
                history
            };
        },

        [Constants.BROWSER_SCROLL_RESULT]: (state, action) => {
            let { history } = state;
            history = _.take(history, history.length - 1).concat(
                action.payload
            );

            return {
                ...state,
                history
            };
        },

        [Constants.BROWSER_HOME]: () => {
            return {
                ...initialState
            };
        },

        [Constants.BROWSER_BACK]: (state, action) => {
            const { history } = state;

            if (history.length === 1) {
                return state;
            }

            return {
                ...state,
                history: _.take(history, history.length - 1)
            };
        }
    },
    initialState
);
