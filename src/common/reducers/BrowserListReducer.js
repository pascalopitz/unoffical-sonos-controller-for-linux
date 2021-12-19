import _ from 'lodash';
import { handleActions } from 'redux-actions';
import Constants from '../constants';

import {
    START_STATE,
    DEFAULT_SEARCH_MODE,
} from '../constants/BrowserListConstants';

const initialState = {
    source: null,
    searchTerm: null,
    searchMode: DEFAULT_SEARCH_MODE,
    history: [
        {
            ...START_STATE,
        },
    ],
};

const resetState = () => {
    return {
        ...initialState,
    };
};

export default handleActions(
    {
        [Constants.BROWSER_SEARCH]: (state, action) => {
            let { history } = state;
            const { term, source, mode } = action.payload;

            if (!term) {
                return {
                    ...state,
                    source,
                    searchTerm: null,
                    searchMode: mode,
                };
            }

            history = history.concat(action.payload);

            return {
                ...state,
                source,
                searchTerm: term,
                history,
            };
        },

        [Constants.BROWSER_SEARCH_EXIT]: (state) => {
            let { history } = state;

            history = history.filter((h) => !h.term);

            return {
                ...state,
                history,
                searchTerm: null,
                searchMode: DEFAULT_SEARCH_MODE,
            };
        },

        [Constants.BROWSER_SELECT_ITEM]: (state, action) => {
            let { history } = state;
            const { term } = action.payload;
            history = history.concat(action.payload);

            if (action.payload.source === 'start') {
                return state;
            }

            return {
                ...state,
                searchTerm: term,
                history,
            };
        },

        [Constants.BROWSER_SCROLL_POSITION]: (state, action) => {
            const { history } = state;

            const lastItem = _.last(history);
            const scrollPosition = action.payload;

            history[history.length - 1] = {
                ...lastItem,
                scrollPosition,
            };

            return {
                ...state,
                history,
            };
        },

        [Constants.BROWSER_SCROLL_RESULT]: (state, action) => {
            let { history } = state;

            history = _.take(history, history.length - 1).concat(
                action.payload
            );

            return {
                ...state,
                history,
            };
        },

        [Constants.BROWSER_HOME]: resetState,
        [Constants.MUSICSERVICE_AUTH_TOKEN_RECEIVED]: resetState,
        [Constants.MUSICSERVICE_ANONYMOUS]: resetState,
        [Constants.MUSICSERVICE_SESSION_ID_RECEIVED]: resetState,

        [Constants.BROWSER_BACK]: (state) => {
            const { history } = state;

            if (history.length === 1) {
                return state;
            }

            return {
                ...state,
                history: _.take(history, history.length - 1),
            };
        },

        [Constants.BROWSER_DELETE_PLAYLIST]: (state, action) => {
            const { history } = state;
            const item = action.payload;

            const ids = history.map((h) => h.id);

            if (ids.indexOf('SQ:') === -1) {
                return state;
            }

            return {
                ...state,
                history: history.map((h) => {
                    return {
                        ...h,
                        items: (h.items || []).filter(
                            (i) => !i._raw || i._raw.id !== item._raw.id
                        ),
                    };
                }),
            };
        },

        [Constants.BROWSER_DELETE_FAVOURITE]: (state, action) => {
            const { history } = state;
            const item = action.payload;

            const ids = history.map((h) => h.id);

            if (ids.indexOf('FV:2') === -1) {
                return state;
            }

            return {
                ...state,
                history: history.map((h) => {
                    return {
                        ...h,
                        items: (h.items || []).filter(
                            (i) => !i._raw || i._raw.id !== item._raw.id
                        ),
                    };
                }),
            };
        },
    },
    initialState
);
