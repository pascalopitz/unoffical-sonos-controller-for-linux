import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService  from '../services/SonosService';
import Services from '../sonos/helpers/Services';

import GroupManagementStore from '../stores/GroupManagementStore';

const REG = /^http:\/\/([\d\.]+)/;

export default {

	showManagement (group) {
		Dispatcher.dispatch({
			actionType: Constants.GROUP_MANAGEMENT_SHOW,
			group: group,
		});
	},

	hideManagement () {
		Dispatcher.dispatch({
			actionType: Constants.GROUP_MANAGEMENT_HIDE,
		});
	},

	select (player) {
		Dispatcher.dispatch({
			actionType: Constants.GROUP_MANAGEMENT_SELECT,
			player: player,
		});
	},

	deselect (player) {
		Dispatcher.dispatch({
			actionType: Constants.GROUP_MANAGEMENT_DESELECT,
			player: player,
		});
	},

	save () {
		let current = GroupManagementStore.getCurrent();
		let coordinator = _.find(current, { coordinator: "true" });

		let players = GroupManagementStore.getPlayers();

		let removed = [];
		let added = [];

		players.forEach((p) => {
			let wasPresent = !!_.find(current, { uuid: p.uuid });

			if(p.selected && !wasPresent) {
				added.push(p);
			}

			if(!p.selected && wasPresent) {
				removed.push(p);
			}
		});

		let coordinatorRemoved = !!_.find(removed, { uuid: coordinator.uuid });
		let lastModified;

		let promise = Promise.resolve();

		added.forEach((p) => {
			let matches = REG.exec(p.location);
			let host = matches[1];

			let sonos = SonosService._deviceSearches[host];
			let avTransport = new Services.AVTransport(sonos.host, sonos.port);

			promise.then(() => {
				return new Promise((resolve, reject) => {
					avTransport.SetAVTransportURI({
						InstanceID: 0,
						CurrentURI: 'x-rincon:' + coordinator.uuid,
						CurrentURIMetaData: '',
					}, (err) => {
						if(err) {
							reject(err);
						} else {
							lastModified = sonos;
							resolve();
						}
					});
				});
			});
		});

		removed.forEach((p) => {
			let matches = REG.exec(p.location);
			let host = matches[1];

			let sonos = SonosService._deviceSearches[host];
			let avTransport = new Services.AVTransport(sonos.host, sonos.port);

			promise.then(() => {
				return new Promise((resolve, reject) => {
					avTransport.BecomeCoordinatorOfStandaloneGroup({
						InstanceID: 0,
					}, (err) => {
						if(err) {
							reject(err);
						} else {
							lastModified = sonos;
							resolve();
						}
					});
				});
			});
		});

		promise.then(() => {
			Dispatcher.dispatch({
				actionType: Constants.GROUP_MANAGEMENT_CHANGED,
			});

			[1,500,1000,1500,2000].forEach((num) => {
				window.setTimeout(() => {
					SonosService.queryTopology(lastModified);
				}, num);
			});
		}, (err) => {
			debugger;
		});
	}

};
