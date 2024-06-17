import { ipcRenderer } from 'electron';

import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

import store from '../reducers';

export const selectGroup = createAction(
    Constants.ZONE_GROUP_SELECT,
    async (zone) => {
        SonosService.selectCurrentZone(zone);

        const state = store.getState();
        const playState = state.sonosService.playStates[zone.host];

        ipcRenderer.send('playstate-update', playState);

        return zone;
    },
);

export const showGroupManagement = createAction(
    Constants.GROUP_MANAGEMENT_SHOW,
);
