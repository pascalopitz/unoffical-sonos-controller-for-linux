"use strict";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService from '../services/SonosService';

export default {

	pause () {
		let sonos = SonosService._currentDevice;
		sonos.pause(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_PAUSE,
			});
			SonosService.queryState();
		});
	},

	play () {
		let sonos = SonosService._currentDevice;
		sonos.play(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_PLAY,
			});
			SonosService.queryState();
		});
	},

	playPrev () {
		let sonos = SonosService._currentDevice;
		sonos.previous(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_PREV,
			});
			SonosService.queryState();
		});
	},

	playNext () {
		let sonos = SonosService._currentDevice;

		sonos.next(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_NEXT,
			});
			SonosService.queryState();
		});
	},

	seek (time) {
		let sonos = SonosService._currentDevice;

		sonos.seek(time, () => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_SEEK,
				time: time,
			});
			SonosService.queryState();
		});
	},

	setPlayMode (mode) {
		let sonos = SonosService._currentDevice;
		let avTransport = new Services.AVTransport(sonos.host, sonos.port);

		avTransport.SetPlayMode({
			InstanceID: 0,
			NewPlayMode: mode,
		}, (err) => {
			Dispatcher.dispatch({
				actionType: Constants.OPTIMISTIC_CURRENT_PLAY_MODE_UPDATE,
				mode: mode,
			});
		});
	},

	setCrossfade (state) {
		let sonos = SonosService._currentDevice;
		let avTransport = new Services.AVTransport(sonos.host, sonos.port);

		avTransport.SetCrossfadeMode({
			InstanceID: 0,
			CrossfadeMode: Number(state),
		}, (err, info) => {
			let mode = state;

			Dispatcher.dispatch({
				actionType: Constants.OPTIMISTIC_CURRENT_CROSSFADE_MODE_UPDATE,
				mode: mode,
			});
		});
	},

	refreshPosition () {
		let sonos = SonosService._currentDevice;

		window.setTimeout(() => {
			SonosService.queryState();
		}, 100)
	},
};
