import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const CHANGE_EVENT = 'change';

var VolumeControlStore = _.assign({}, events.EventEmitter.prototype, {

	_muted: false,
	_volume: 0,

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	getMuted () {
		return this._muted ;
	},

	setMuted (muted) {
		this._muted = muted;
	},

	getVolume () {
		return this._volume;
	},

	setVolume (volume) {
		this._volume = volume;
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {
		case Constants.SONOS_SERVICE_MUTED_UPDATE:
			VolumeControlStore.setMuted(action.muted);
			VolumeControlStore.emitChange();
			break;

		case Constants.SONOS_SERVICE_VOLUME_UPDATE:
			VolumeControlStore.setVolume(action.volume);
			VolumeControlStore.emitChange();
			break;
	}
});

export default VolumeControlStore;

