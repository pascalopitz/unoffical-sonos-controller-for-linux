import { createAction } from 'redux-actions';
import Contants from '../constants';

// import store from '../reducers/GroupManagementreducer';

export const hideGroupManagement = createAction(Contants.GROUP_MANAGEMENT_HIDE);
export const toggleGroupChecked = createAction(
    Contants.GROUP_MANAGEMENT_TOGGLE
);

export const saveGroups = createAction(
    Contants.GROUP_MANAGEMENT_SAVE,
    async selected => {
        // const current = store.current;
        // const coordinator = _.find(current, { coordinator: 'true' });

        // const players = store.players;

        // const removed = [];
        // const added = [];

        return await new Promise(resolve =>
            setTimeout(() => resolve(selected), 5000)
        );

        // players.forEach(p => {
        //     const wasPresent = !!_.find(current, { uuid: p.uuid });

        //     if (p.selected && !wasPresent) {
        //         added.push(p);
        //     }

        //     if (!p.selected && wasPresent) {
        //         removed.push(p);
        //     }
        // });

        // const promise = Promise.resolve();

        // added.forEach(p => {
        //     const matches = REG.exec(p.location);
        //     const host = matches[1];

        //     const sonos = store.deviceSearches[host];
        //     const avTransport = new Services.AVTransport(
        //         sonos.host,
        //         sonos.port
        //     );

        //     promise.then(() => {
        //         return new Promise((resolve, reject) => {
        //             avTransport.SetAVTransportURI(
        //                 {
        //                     InstanceID: 0,
        //                     CurrentURI: 'x-rincon:' + coordinator.uuid,
        //                     CurrentURIMetaData: ''
        //                 },
        //                 err => {
        //                     if (err) {
        //                         reject(err);
        //                     } else {
        //                         resolve();
        //                     }
        //                 }
        //             );
        //         });
        //     });
        // });

        // removed.forEach(p => {
        //     const matches = REG.exec(p.location);
        //     const host = matches[1];

        //     const sonos = store.deviceSearches[host];
        //     const avTransport = new Services.AVTransport(
        //         sonos.host,
        //         sonos.port
        //     );

        //     promise.then(() => {
        //         return new Promise((resolve, reject) => {
        //             avTransport.BecomeCoordinatorOfStandaloneGroup(
        //                 {
        //                     InstanceID: 0
        //                 },
        //                 err => {
        //                     if (err) {
        //                         reject(err);
        //                     } else {
        //                         resolve();
        //                     }
        //                 }
        //             );
        //         });
        //     });
        // });

        // const val = await promise;
        // return val;

        // promise.then(() => {
        //     Dispatcher.dispatch({
        //         actionType: Constants.GROUP_MANAGEMENT_CHANGED
        //     });

        //     [1, 500, 1000, 1500, 2000].forEach(num => {
        //         window.setTimeout(() => {
        //             SonosService.queryTopology(lastModified);
        //         }, num);
        //     });
        // });
    }
);
