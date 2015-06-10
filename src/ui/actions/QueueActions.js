import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService  from '../services/SonosService'

export default {

	setTracks (tracks) {
		Dispatcher.dispatch({
			actionType: Constants.QUEUE_TRACKS_SET,
			tracks: tracks
		});
	},

	flush () {
		let sonos = SonosService._currentDevice;

		sonos.flush(() => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_FLUSH,
			});
		});
	},

	gotoPosition (position) {
		let sonos = SonosService._currentDevice;

		sonos.goto(position, () => {
			sonos.play(() => {
				Dispatcher.dispatch({
					actionType: Constants.QUEUE_GOTO,
					position: position,
				});
			});
		});
	}
};