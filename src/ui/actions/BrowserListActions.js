"use strict";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService from '../services/SonosService';

import QueueStore from '../stores/QueueStore';

export default {

	back () {
		Dispatcher.dispatch({
			actionType: Constants.BROWSER_BACK,
		});
	},

	more (state) {
		let sonos = SonosService._currentDevice;

		sonos.getMusicLibrary(state.searchType, {
			start: state.items.length
		}, (err, result) => {
			if(err || !result || !result.items) {
				return;
			}

			state.items = state.items.concat(result.items);

			Dispatcher.dispatch({
				actionType: Constants.BROWSER_SCROLL_RESULT,
				state: state,
			});
		});
	},

	playNow (item) {
		let sonos = SonosService._currentDevice;

		sonos.getMusicLibrary('queue', {total: 0}, (err, res) => {
			let pos = Number(res.total) + 1;
			sonos.queue(item, () => {
				sonos.goto(pos, () => {
					sonos.play(() => {
						SonosService.queryState(sonos);
					});
				});
			});
		});
	},

	playNext (item) {
		let sonos = SonosService._currentDevice;

		sonos.getPositionInfo((err, info) => {
			let pos = Number(info.Track) + 1;
			sonos.queue(item, pos, () => {
				SonosService.queryState(sonos);
			});
		});
	},


	addQueue (item) {
		let sonos = SonosService._currentDevice;

		sonos.queue(item, () => {
			SonosService.queryState(sonos);
		});
	},


	replaceQueue (item) {
		let sonos = SonosService._currentDevice;

		sonos.flush(() => {
			sonos.queue(item, () => {
				sonos.play(() => {
					SonosService.queryState(sonos);
				});
			});
		});
	},

	select (item) {

		let sonos = SonosService._currentDevice;
		let prendinBrowserUpdate;
		let objectId = item.searchType;

		if(item.searchType) {
			prendinBrowserUpdate = {
				title : item.title,
				searchType : item.searchType
			};
		} else {
			prendinBrowserUpdate = item;
		}

		if(item.class) {
			objectId = item.uri.split('#')[1];
		}

		sonos.getMusicLibrary(objectId, {}, (err, result) => {
			var state = prendinBrowserUpdate;
			state.items = result.items;

			Dispatcher.dispatch({
				actionType: Constants.BROWSER_SELECT_ITEM,
				state: state,
			});
		});
	},

	changeSearchMode (mode) {
		Dispatcher.dispatch({
			actionType: Constants.BROWSER_CHANGE_SEARCH_MODE,
			mode: mode,
		});
	}
};