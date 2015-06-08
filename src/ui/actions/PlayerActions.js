import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService  from '../services/SonosService'

export default {

	pause () {
		let sonos = SonosService._currentDevice;
		sonos.pause(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_PAUSE,
			});
		});
	},

	play () {
		let sonos = SonosService._currentDevice;
		sonos.play(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_PLAY,
			});
		});
	},

	playPrev () {
		let sonos = SonosService._currentDevice;
		sonos.previous(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_PREV,
			});
		});
	},

	playNext () {
		let sonos = SonosService._currentDevice;

		sonos.next(() => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_NEXT,
			});
		});
	},

	seek (time) {
		let sonos = SonosService._currentDevice;

		sonos.seek(time, () => {
			Dispatcher.dispatch({
				actionType: Constants.PLAYER_SEEK,
				time: time,
			});
		});
	},
};