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

        if (name === 'balance') {
            await sonos.setBalance(value);
        }

        return { host, name, value };
    }
);

export const select = createAction(Constants.EQ_SELECT);
export const hide = createAction(Constants.EQ_HIDE);

export const loadPlayer = createAction(Constants.EQ_LOAD, async (host) => {
    const sonos = SonosService.getDeviceByHost(host);
    const renderingControl = sonos.renderingControlService();

    const balance = await sonos.getBalance();
    const bass = await renderingControl.GetBass();
    const treble = await renderingControl.GetTreble();
    const loudness = await renderingControl.GetLoudness();
    const calibration = await renderingControl.GetRoomCalibrationStatus();

    return {
        host,
        balance,
        bass,
        treble,
        loudness,
        calibration,
    };
});

export const show = createAction(Constants.EQ_SHOW, async (host) => {
    const state = store.getState();
    const { currentHost } = state.sonosService;
    const players = getPlayers(state);

    await store.dispatch(select(host || currentHost || players[0].host));

    for (const p of players) {
        await store.dispatch(loadPlayer(p.host));
    }
});

export const breakPair = createAction(
    Constants.EQ_BREAK_PAIR,
    async (player) => {
        const sonos = SonosService.getDeviceByHost(player.host);
        const deviceProperties = sonos.devicePropertiesService();

        await deviceProperties.RemoveBondedZones();

        store.dispatch(show());
    }
);

export const createPair = createAction(
    Constants.EQ_CREATE_PAIR,
    async (player, pairedPlayer, pairOn) => {
        const right = pairOn === 'RF' ? player : pairedPlayer;
        const left = pairOn === 'LF' ? player : pairedPlayer;

        const channelMap = `${left.UUID}:LF,LF;${right.UUID}:RF,RF`;

        // GOTCHA: the player needs to be the one on the left, otherwise UPNP call fails
        const leftSonos = SonosService.getDeviceByHost(left.host);
        const rightSonos = SonosService.getDeviceByHost(right.host);
        const deviceProperties = leftSonos.devicePropertiesService();

        await leftSonos.becomeCoordinatorOfStandaloneGroup();
        await rightSonos.becomeCoordinatorOfStandaloneGroup();
        await deviceProperties.AddBondedZones(channelMap);
        await deviceProperties.SetZoneAttributes(player.ZoneName, player.Icon);

        store.dispatch(show(leftSonos.host));
    }
);

export const setTruePlay = createAction(
    Constants.EQ_TRUEPLAY,
    async ({ host, value }) => {
        const sonos = SonosService.getDeviceByHost(host);
        const renderingControl = sonos.renderingControlService();

        const calibration = await renderingControl.SetRoomCalibrationStatus(
            value
        );

        store.dispatch(loadPlayer(host));

        return {
            host,
            calibration,
        };
    }
);
