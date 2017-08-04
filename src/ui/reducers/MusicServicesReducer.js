import { handleActions } from 'redux-actions';
import Constants from '../constants';

import MusicServiceClient from '../services/MusicServiceClient';

const initialState = {
    active: [],
    visible: false,
    link: null,
    current: null
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

        [Constants.SONOS_SERVICE_MUSICSERVICES_UPDATE]: state => {
            return {
                ...state,
                visible: false,
                current: null,
                link: null
            };
        },

        [Constants.MUSICSERVICE_ADD_CANCEL]: state => {
            return {
                ...state,
                visible: false,
                current: null,
                link: null
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
        }
    },
    initialState
);
