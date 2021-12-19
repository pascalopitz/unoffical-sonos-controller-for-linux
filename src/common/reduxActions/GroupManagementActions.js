import find from 'lodash/find';
import includes from 'lodash/includes';
import difference from 'lodash/difference';

import { createAction } from 'redux-actions';
import Contants from '../constants';

import store from '../reducers';

import SonosService from '../services/SonosService';
import { getPlayers } from '../selectors/GroupManagementSelectors';

export const hideGroupManagement = createAction(Contants.GROUP_MANAGEMENT_HIDE);

export const toggleZoneChecked = createAction(Contants.GROUP_MANAGEMENT_TOGGLE);

export const saveGroups = createAction(
    Contants.GROUP_MANAGEMENT_SAVE,
    async () => {
        const state = store.getState();
        const { selected, currentGroup } = state.groupManagement;

        const allPlayers = getPlayers(state);

        const currentGroupMembers = allPlayers.filter(
            (z) => z.inGroup === currentGroup
        );

        const currentCoordinator = find(currentGroupMembers, {
            isCoordinator: true,
        });

        const targetGroupMembers = allPlayers.filter((z) =>
            includes(selected, z.UUID)
        );

        const removingGroupMembers = difference(
            currentGroupMembers,
            targetGroupMembers
        );

        const addingGroupMembers = targetGroupMembers.filter(
            (z) => z !== currentCoordinator
        );

        try {
            for (const z of addingGroupMembers) {
                const sonos = SonosService.getDeviceByHost(z.host);
                await sonos.setAVTransportURI({
                    uri: `x-rincon:${currentCoordinator.UUID}`,
                    onlySetUri: true,
                });
            }

            for (const z of removingGroupMembers) {
                const sonos = SonosService.getDeviceByHost(z.host);
                await sonos.becomeCoordinatorOfStandaloneGroup();
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
);
