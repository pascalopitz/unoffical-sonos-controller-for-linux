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

	play (item) {
		let sonos = SonosService._currentDevice;

		sonos.queue(item, () => {
			SonosService.queryState(sonos);
		});

		Dispatcher.dispatch({
			actionType: Constants.BROWSER_PLAY,
			state: item,
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