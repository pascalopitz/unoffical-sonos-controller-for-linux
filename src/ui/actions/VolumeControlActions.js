"use strict";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService  from '../services/SonosService';

export default {

	queryVolumes () {
		SonosService.queryVolumeInfo();
	},

	setPlayerVolume(host, volume) {
		let sonos = SonosService._deviceSearches[host];

		sonos.setVolume(volume, () => {
			Dispatcher.dispatch({
				actionType: Constants.VOLUME_CONTROLS_VOLUME_SET,
				host: host,
				volume: volume,
			});

			SonosService.queryVolumeInfo();
		});
	},

	setPlayerMuted(host, muted) {
		let sonos = SonosService._deviceSearches[host];

		sonos.setMuted(muted, () => {
			Dispatcher.dispatch({
				actionType: Constants.VOLUME_CONTROLS_MUTE_SET,
				host: host,
				muted: muted,
			});

			SonosService.queryVolumeInfo();
		});
	},

};
