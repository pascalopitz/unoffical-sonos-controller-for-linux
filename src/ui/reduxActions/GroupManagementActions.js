import _ from 'lodash';
import { createAction } from 'redux-actions';
import Contants from '../constants';

import store from '../reducers';

import SonosService from '../services/SonosService';
import serviceFactory from '../sonos/helpers/ServiceFactory';

export const hideGroupManagement = createAction(Contants.GROUP_MANAGEMENT_HIDE);

export const toggleZoneChecked = createAction(Contants.GROUP_MANAGEMENT_TOGGLE);

export const saveGroups = createAction(
    Contants.GROUP_MANAGEMENT_SAVE,
    async () => {
        const state = store.getState();
        const { zones } = state.sonosService;
        const { selected, currentGroup } = state.groupManagement;

        const currentGroupMembers = zones.filter(z => z.group === currentGroup);

        const targetGroupMembers = zones.filter(z =>
            _.includes(selected, z.uuid)
        );

        const removingGroupMembers = _.difference(
            currentGroupMembers,
            targetGroupMembers
        );

        const coordinator =
            _.find(targetGroupMembers, {
                coordinator: 'true',
                group: currentGroup
            }) ||
            _.find(targetGroupMembers, {
                coordinator: 'true'
            }) ||
            _.head(targetGroupMembers);

        const addingGroupMembers = targetGroupMembers.filter(
            z => z !== coordinator
        );

        try {
            for (const z of addingGroupMembers) {
                const sonos = SonosService.getDeviceByHost(z.host);
                const avTransport = serviceFactory('AVTransport', sonos);
                await avTransport.SetAVTransportURIAsync({
                    InstanceID: 0,
                    CurrentURI: 'x-rincon:' + coordinator.uuid,
                    CurrentURIMetaData: ''
                });
            }

            for (const z of removingGroupMembers) {
                const sonos = SonosService.getDeviceByHost(z.host);
                const avTransport = serviceFactory('AVTransport', sonos);
                await avTransport.BecomeCoordinatorOfStandaloneGroupAsync({
                    InstanceID: 0
                });
            }

            [1, 500, 1000, 1500, 2000, 3000, 5000, 10000].forEach(num => {
                window.setTimeout(() => {
                    SonosService.queryTopology();
                }, num);
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
);
