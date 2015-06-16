import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService  from '../services/SonosService';
import Services from '../sonos/helpers/Services';

export default {

	setTracks (tracks) {
		Dispatcher.dispatch({
			actionType: Constants.QUEUE_TRACKS_SET,
			tracks: tracks
		});
		SonosService.queryState();
	},

	flush () {
		let sonos = SonosService._currentDevice;

		sonos.flush(() => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_FLUSH,
			});
			SonosService.queryState();
		});
	},

	gotoPosition (position) {
		let sonos = SonosService._currentDevice;

		sonos.selectQueue(() => {
			sonos.goto(position, () => {
				sonos.play(() => {
					Dispatcher.dispatch({
						actionType: Constants.QUEUE_GOTO,
						position: position,
					});
					SonosService.queryState();
				});
			});
		});
	},

	removeTrack (position) {
		let sonos = SonosService._currentDevice;

		let params = {
			InstanceID: 0,
			UpdateID: 0,
			StartingIndex: position,
			NumberOfTracks: 1,
		};

		var avTransport = new Services.AVTransport(sonos.host, sonos.port);

		avTransport.RemoveTrackRangeFromQueue(params, () => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_REMOVE,
				position: position,
				number: 1,
			});
			SonosService.queryState();
		});

	}
};