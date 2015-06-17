"use strict";

import _ from 'lodash';
import xml2json from 'jquery-xml2json';

import Search from '../sonos/Search';
import Listener from '../sonos/events/listener';

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants from '../constants/Constants'

import ZoneGroupStore from '../stores/ZoneGroupStore';

const REG = /^http:\/\/([\d\.]+)/;
const QUERY_INTERVAL = 10000;

let SonosService = {

	_currentDevice: null,
	_queryInterval: null,
	_deviceSearches: {},
	_listeners: {},
	_persistentSubscriptions: [],
	_currentSubscriptions: [],
	_searchInterval: null,

	mount () {
		this._searchInterval = window.setInterval(this.searchForDevices.bind(this), 1000);
		this.searchForDevices();
	},

	searchForDevices () {
		new Search((sonos) => {

			if(this._searchInterval) {
				window.clearInterval(this._searchInterval);
			}

			let listener = new Listener(sonos);

			this._deviceSearches[sonos.host] = sonos;
			this._listeners[sonos.host] = listener;

			listener.listen((err) => {
				if (err) throw err;

				listener.onServiceEvent(this.onServiceEvent.bind(this));

				// these events happen for all players
				listener.addService('/MediaRenderer/RenderingControl/Event', (err, sid) => {
					if(!err) {
						this._persistentSubscriptions.push({
							sid: sid,
							host: sonos.host,
							sonos: sonos,
						});
					}
				});

				if(!this._currentDevice) {
					this._currentDevice = sonos;
					this.subscribeServiceEvents(sonos);
				}
			});

		});
	},


	queryTopology (sonos) {
		sonos.getTopology((err, info) => {
			if(err) {
				return;
			}

			chrome.storage.local.get(['zone'], (vals) => {

				let zone = _(info.zones).findWhere({
					coordinator: "true"
				});;

				if(vals.zone) {
					let match = _(info.zones).findWhere({
						group: vals.zone,
						coordinator: "true"
					});

					zone = match || zone;
				}

				// this.selectCurrentZone(zone);
				// this.queryState();
				// Dispatcher.dispatch({
				// 	actionType: Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT,
				// 	group: zone,
				// });
			});

			// Dispatcher.dispatch({
			// 	actionType: Constants.SONOS_SERVICE_TOPOLOGY_UPDATE,
			// 	groups: info.zones,
			// });
			// TODO: update topology from here as well
			// match different format somehow
		});
	},

	queryVolumeInfo () {
		let group = ZoneGroupStore.getCurrent();

		if(!group) {
			return;
		}

		group.ZoneGroupMember.forEach((m) => {

			let l = m.$.Location;
			let matches = REG.exec(l);
			let sonos = this._deviceSearches[matches[1]];

			sonos.getMuted((err, muted) => {
				if(err) {
					return;
				}
				sonos.getVolume((err, volume) => {
					if(err) {
						return;
					}
					Dispatcher.dispatch({
						actionType: Constants.SONOS_SERVICE_VOLUME_UPDATE,
						volume: volume,
						muted: muted,
						sonos: sonos,
					});
				});
			});
		});
	},

	queryState (sonos) {

		sonos = sonos || this._currentDevice;

		// TODO: I should be able to do all of these in a promise based op
		// i.e. seek->getPosition
		sonos.getPositionInfo((err, info) => {
			if(err) {
				return;
			}
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_POSITION_INFO_UPDATE,
				info: info,
			});
		});

		this.queryVolumeInfo();
		// this.queryTopology(sonos);

		sonos.currentTrack((err, track) => {
			if(err) {
				return;
			}
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_CURRENT_TRACK_UPDATE,
				track: track,
			});
		});

		sonos.getCurrentState((err, state) => {
			if(err) {
				return;
			}
			this.processPlaystateUpdate(state);
		});

		sonos.getMusicLibrary('queue', {}, (err, result) => {
			if(err) {
				return;
			}
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_QUEUE_UPDATE,
				result: result,
			});
		});
	},

	processPlaystateUpdate (state) {

		let publishState = (state) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_PLAYSTATE_UPDATE,
				state: state,
			});
		};

		if(state === 'transitioning') {
			window.setTimeout(() => {
				this._currentDevice.getCurrentState((err, state) => {
					this.processPlaystateUpdate(state);
				});
			}, 100);
		}

		publishState(state);
	},

	onServiceEvent (endpoint, sid, data) {

		switch (endpoint) {

			case '/ZoneGroupTopology/Event':
				{
					let state = xml2json(data.ZoneGroupState, {
						explicitArray: true
					});

					Dispatcher.dispatch({
						actionType: Constants.SONOS_SERVICE_ZONEGROUPS_UPDATE,
						groups: state.ZoneGroups.ZoneGroup,
					});

					if(!ZoneGroupStore.getCurrent()) {

						chrome.storage.local.get(['zone'], (vals) => {

							let zone = state.ZoneGroups.ZoneGroup[0];

							if(vals.zone) {
								let match = _(state.ZoneGroups.ZoneGroup).findWhere({
									$: {
										ID: vals.zone
									}
								});

								zone = match || zone;
							}

							this.selectCurrentZone(zone);
							this.queryState();
							Dispatcher.dispatch({
								actionType: Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT,
								group: zone,
							});

						});

					}
				}
				break;

			case '/MediaRenderer/RenderingControl/Event':
				{
					let lastChange = xml2json(data.LastChange, {
						explicitArray: false
					});

					let subscription = _(this._persistentSubscriptions).findWhere({sid: sid});

					if(subscription) {
						Dispatcher.dispatch({
							actionType: Constants.SONOS_SERVICE_VOLUME_UPDATE,
							volume: Number(lastChange.Event.InstanceID.Volume[0].$.val),
							muted: Boolean(Number(lastChange.Event.InstanceID.Mute[0].$.val)),
							sonos: subscription.sonos,
						});
					}
				}
				break;

			case'/MediaRenderer/AVTransport/Event':
				{
					let lastChange = xml2json(data.LastChange);

					let currentTrackDIDL = xml2json(lastChange.Event.InstanceID.CurrentTrackMetaData.$.val, {
						explicitArray: true
					});

					let nextTrackDIDL = xml2json(lastChange.Event.InstanceID['r:NextTrackMetaData'].$.val, {
						explicitArray: true
					});

					Dispatcher.dispatch({
						actionType: Constants.SONOS_SERVICE_CURRENT_TRACK_UPDATE,
						track: this._currentDevice.parseDIDL(currentTrackDIDL),
					});

					Dispatcher.dispatch({
						actionType: Constants.SONOS_SERVICE_NEXT_TRACK_UPDATE,
						track: this._currentDevice.parseDIDL(nextTrackDIDL),
					});

					this.processPlaystateUpdate(this._currentDevice.translateState(lastChange.Event.InstanceID.TransportState.$.val));
				}
				break;
		}
	},

	subscribeServiceEvents (sonos) {
		var x = this._listeners[sonos.host];

		let cb = (error, sid) => {
			if (error) throw err;
			this._currentSubscriptions.push(sid);
		}

		x.addService('/ZoneGroupTopology/Event', cb);
		x.addService('/MediaRenderer/AVTransport/Event', cb);
		x.addService('/MediaRenderer/GroupRenderingControl/Event', cb);
		x.addService('/MediaServer/ContentDirectory/Event', cb);
	},


	unsubscribeServiceEvents (sonos) {
		var x = this._listeners[sonos.host];

		this._currentSubscriptions.forEach((sid) => {
			x.removeService(sid, (error) => {
				if (error) throw error;
				console.log('Successfully unsubscribed');
			});
		});

		this._currentSubscriptions = [];
	},

	selectCurrentZone (value) {
		var sonos;

		chrome.storage.local.set({
			zone: value.$.ID
		}, () => {});

		value.ZoneGroupMember.forEach((m) => {
			if(m.$.UUID === value.$.Coordinator) {
				let l = m.$.Location;
				let matches = REG.exec(l);
				sonos = this._deviceSearches[matches[1]];
			}
		});

		if(sonos) {
			if(this._currentDevice) {
				this.unsubscribeServiceEvents(this._currentDevice);
			}

			if(this._queryInterval) {
				window.clearInterval(this._queryInterval);
			}

			this._currentDevice = sonos;

			this.subscribeServiceEvents(sonos);
			this.queryState(sonos);
			this._queryInterval = window.setInterval(() => {
					this.queryState(this._currentDevice);
			}, QUERY_INTERVAL);
		}
	},
};

export default SonosService;