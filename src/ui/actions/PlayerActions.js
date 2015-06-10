import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService from '../services/SonosService'

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
};