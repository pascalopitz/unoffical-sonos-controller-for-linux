import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService from '../services/SonosService'

import BrowserListStore from '../stores/BrowserListStore'

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
			state.items = state.items.concat(result.items);

			Dispatcher.dispatch({
				actionType: Constants.BROWSER_SCROLL_RESULT,
				state: state,
			});
		});
	},

	select (item) {

		let sonos = SonosService._currentDevice;
		let prendinBrowserUpdate;
		let objectId = item.searchType;

		if(item.searchType) {
			prendinBrowserUpdate = {
				headline : item.title,
				searchType : item.searchType
			};
		} else {
			prendinBrowserUpdate = item;
		}

		if(item.class === 'object.item.audioItem.musicTrack') {
			sonos.queue(item, () => {
				SonosService.queryState(sonos);
			});

			Dispatcher.dispatch({
				actionType: Constants.BROWSER_PLAY,
				state: item,
			});
			return;
		}

		if(item.class) {
			let tokens = [escape(item.headline)];

			_(BrowserListStore.getHistory())
				.reverse()
				.forEach((i) => {
					tokens.unshift(i.searchType || escape(i.headline));
				});

			console.log(tokens.join('/'));
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

};