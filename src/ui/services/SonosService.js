import _ from 'lodash';
import xml2json from 'jquery-xml2json';

import Search from '../sonos/Search';
import Listener from '../sonos/events/listener';

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants	from '../constants/Constants'

import ZoneGroupStore from '../stores/ZoneGroupStore';

const REG = /^http:\/\/([\d\.]+)/;
const QUERY_INTERVAL = 5000;

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
		sonos.getPositionInfo((err, info) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_POSITION_INFO_UPDATE,
				info: info,
			});
		});

		sonos.getVolume((err, vol) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_VOLUME_UPDATE,
				vol: vol,
			});
		});

		// sonos.getGroupMuted((err, muted) => {
		// 	cursor.refine('volumeControls', 'master', 'mute').set(muted);
		// });

		sonos.currentTrack((err, track) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_CURRENT_TRACK_UPDATE,
				track: track,
			});
		});

		sonos.getCurrentState((err, state) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_PLAYSTATE_UPDATE,
				state: state,
			});
		});

		sonos.getMusicLibrary('queue', {}, (err, result) => {
			Dispatcher.dispatch({
				actionType: Constants.SONOS_SERVICE_QUEUE_UPDATE,
				result: result,
			});
		});
	},

	onServiceEvent (endpoint, sid, data) {
		if(endpoint === '/ZoneGroupTopology/Event') {
			var state = xml2json(data.ZoneGroupState, {
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
		}

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



		// if(endpoint === '/MediaRenderer/AVTransport/Event') {
		// 	var lastChange = xml2json(data.LastChange);

		// 	var currentTrackDIDL = xml2json(lastChange.Event.InstanceID.CurrentTrackMetaData.$.val, {
		// 		explicitArray: true
		// 	});

		// 	var nextTrackDIDL = xml2json(lastChange.Event.InstanceID['r:NextTrackMetaData'].$.val, {
		// 		explicitArray: true
		// 	});

		// 	cursor.merge({
		// 		currentTrack: sonos.parseDIDL(currentTrackDIDL),
		// 		nextTrack: sonos.parseDIDL(nextTrackDIDL)
		// 	});

		// 	this.setCurrentState(sonos.translateState(lastChange.Event.InstanceID.TransportState.$.val));
		// }
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
					this.queryState(sonos);
			}, QUERY_INTERVAL);
		}
	},
};

export default SonosService;