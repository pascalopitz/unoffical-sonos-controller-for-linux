import { handleActions } from 'redux-actions';
import Constants from '../constants';

import MusicServiceClient from '../services/MusicServiceClient';

const initialState = {
    active: [],
    visible: false,
    link: null,
    current: null
};

const closeDialogue = state => {
    return {
        ...state,
        visible: false,
        current: null,
        link: null
    };
};

export default handleActions(
    {
        [Constants.BROWSER_ADD_MUSICSERVICE]: (state, action) => {
            const { data } = action.payload;

            return {
                ...state,
                current: new MusicServiceClient(data),
                visible: true
            };
        },

        [Constants.SONOS_SERVICE_MUSICSERVICES_UPDATE]: (state, action) => {
            return {
                ...state,
                active: action.payload
            };
        },

        [Constants.MUSICSERVICE_ADD_LINK_RECEIVED]: (state, action) => {
            return {
                ...state,
                link: action.payload
            };
        },

        [Constants.MUSICSERVICE_ADD_CANCEL]: closeDialogue,
        [Constants.MUSICSERVICE_AUTH_TOKEN_RECEIVED]: closeDialogue,
        [Constants.MUSICSERVICE_SESSION_ID_RECEIVED]: closeDialogue
    },
    initialState
);
