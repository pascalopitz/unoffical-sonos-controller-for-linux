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
	_currentSubscriptions: [],

	mount () {
		this.searchForDevices();
	},

	searchForDevices () {
		new Search((sonos) => {

			let listener = new Listener(sonos);

			this._deviceSearches[sonos.host] = sonos;
			this._listeners[sonos.host] = listener;

			listener.listen((err) => {
				if (err) throw err;

				listener.addService('/MediaRenderer/RenderingControl/Event', () => {});

				listener.onServiceEvent(this.onServiceEvent.bind(this));

				if(!this._currentDevice) {
					this._currentDevice = sonos;
					this.subscribeServiceEvents(sonos);
				}
			});

		});
	},

	queryState (sonos) {

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

		sonos.getVolume((err, volume) => {
			if(err) {
				return;
			}
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_VOLUME_UPDATE,
				volume: volume,
			});
		});

		sonos.getGroupMuted((err, muted) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_MUTED_UPDATE,
				muted: muted,
			});
		});

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
				let state = xml2json(data.ZoneGroupState, {
					explicitArray: true
				});

				Dispatcher.dispatch({
					actionType: Constants.SONOS_SERVICE_ZONEGROUPS_UPDATE,
					groups: state.ZoneGroups.ZoneGroup,
				});

				if(!ZoneGroupStore.getCurrent()) {
					this.selectCurrentZone(state.ZoneGroups.ZoneGroup[0]);
					Dispatcher.dispatch({
						actionType: Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT,
						group: state.ZoneGroups.ZoneGroup[0],
					});
				}

				break;

			// if(endpoint === '/MediaRenderer/RenderingControl/Event') {
			// 	var lastChange = xml2json(data.LastChange, {
			// 		explicitArray: false
			// 	});

			// 	if(lastChange.Event.InstanceID.Muted) {
			// 			cursor.refine('volumeControls', 'players', sonos.host).set({
			// 					muted: lastChange.Event.InstanceID.Muted[0].$.val,
			// 					volume: lastChange.Event.InstanceID.Volume[0].$.val,
			// 			});
			// 	}
			// }



			case'/MediaRenderer/AVTransport/Event':
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
				if (error) throw err;
				console.log('Successfully unsubscribed');
			});
		});

		this._currentSubscriptions = [];
	},

	selectCurrentZone (value) {
		var sonos;

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