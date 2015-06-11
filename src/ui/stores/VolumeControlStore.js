import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const REG = /^http:\/\/([\d\.]+)/;
const CHANGE_EVENT = 'change';

var VolumeControlStore = _.assign({}, events.EventEmitter.prototype, {

	_all: {},
	_players: {},

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	intializeGroup (group) {
		this._players = {};

		group.ZoneGroupMember.forEach((m) => {
			let matches = REG.exec(m.$.Location);

			if(matches) {
				let host = matches[1];

				let defaults = {
					volume: 0,
					muted: false,
				};

				if(this._all[host]) {
					defaults = this._all[host];
				}

				this._players[host] = _.assign(defaults,{
					name: m.$.ZoneName
				});
			}
		});
	},

	getPlayers () {
		return this._players;
	},

	setPlayer (host, obj) {
		this._all[host] = {};
		_.assign(this._all[host], obj);
		_.assign(this._players[host], obj);
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {

		case Constants.VOLUME_CONTROLS_VOLUME_SET:
			VolumeControlStore.setPlayer(action.host, {
				volume: action.volume,
			});
			VolumeControlStore.emitChange();
			break;

		case Constants.VOLUME_CONTROLS_MUTE_SET:
			VolumeControlStore.setPlayer(action.host, {
				muted: action.muted,
			});
			VolumeControlStore.emitChange();
			break;

		case Constants.ZONE_GROUP_SELECT:
		case Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT:
			VolumeControlStore.intializeGroup(action.group);
			VolumeControlStore.emitChange();
			break;

		case Constants.SONOS_SERVICE_VOLUME_UPDATE:
			VolumeControlStore.setPlayer(action.sonos.host, {
				volume: action.volume,
				muted: action.muted
			});
			VolumeControlStore.emitChange();
			break;
	}
});

export default VolumeControlStore;

