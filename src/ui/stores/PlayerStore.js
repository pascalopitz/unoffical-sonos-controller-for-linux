"use strict";

import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const CHANGE_EVENT = 'change';

var PlayerStore = _.assign({}, events.EventEmitter.prototype, {

	_playing : false,
	_positionInfo: null,

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	isPlaying () {
		return this._playing;
	},

	setPlaying (playing) {
		this._playing = playing;
	},

	getPositionInfo () {
		return this._positionInfo ;
	},

	setPositionInfo (info) {
		this._positionInfo = info;
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {
		case Constants.PLAYER_SEEK:
			break;

		case Constants.ZONE_GROUP_SELECT:
			PlayerStore.setPositionInfo(0);
			PlayerStore.emitChange();
			break;

		case Constants.PLAYER_PAUSE:
			PlayerStore.setPlaying(false);
			PlayerStore.emitChange();
			break;

		case Constants.PLAYER_PLAY:
			PlayerStore.setPlaying(true);
			PlayerStore.emitChange();
			break;

		case Constants.SONOS_SERVICE_PLAYSTATE_UPDATE:
			let state = action.state;
			let playing = false;

			if(state === 'transitioning') {
				return;
			}

			if(state === 'playing') {
				playing = true;
			}

			PlayerStore.setPlaying(playing);
			PlayerStore.emitChange();
			break;

		case Constants.SONOS_SERVICE_POSITION_INFO_UPDATE:
			PlayerStore.setPositionInfo(action.info);
			PlayerStore.emitChange();
			break;
	}
});

export default PlayerStore;

