import { createAction } from 'redux-actions';
import Constants from '../constants';

import SonosService from '../services/SonosService';

import store from '../reducers';

import { getPlayers } from '../selectors/GroupManagementSelectors';

export const setValue = createAction(
    Constants.EQ_SET_VALUE,
    async ({ host, name, value }) => {
        const sonos = SonosService.getDeviceByHost(host);
        const renderingControl = sonos.renderingControlService();

        if (name === 'bass') {
            await renderingControl.SetBass(value);
        }

        if (name === 'treble') {
            await renderingControl.SetTreble(value);
        }

        if (name === 'loudness') {
            await renderingControl.SetLoudness(value);
        }

        return { host, name, value };
    }
);

export const select = createAction(Constants.EQ_SELECT);
export const hide = createAction(Constants.EQ_HIDE);

export const loadPlayer = createAction(Constants.EQ_LOAD, async (host) => {
    const sonos = SonosService.getDeviceByHost(host);
    const renderingControl = sonos.renderingControlService();

    const bass = await renderingControl.GetBass();
    const treble = await renderingControl.GetTreble();
    const loudness = await renderingControl.GetLoudness();

    return {
        host,
        bass,
        treble,
        loudness,
    };
});

export const show = createAction(Constants.EQ_SHOW, async () => {
    const state = store.getState();
    const { currentHost } = state.sonosService;
    const players = getPlayers(state);

    await store.dispatch(select(currentHost || players[0].host));

    for (const p of players) {
        await store.dispatch(loadPlayer(p.host));
    }
});
