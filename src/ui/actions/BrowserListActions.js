import Dispatcher from '../dispatcher/AppDispatcher'
import Constants	from '../constants/Constants'

import SonosService	from '../services/SonosService'

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

		if(item.class) {
			sonos.queue(item, () => {
				this.queryState(sonos);
			});

			Dispatcher.dispatch({
				actionType: Constants.BROWSER_PLAY,
				state: state,
			});
		}


		if(item.searchType) {
			prendinBrowserUpdate = {
				headline : item.title,
				searchType : item.searchType
			};
		} else {
			prendinBrowserUpdate = item;
		}

		sonos.getMusicLibrary(item.searchType, {}, (err, result) => {
			var state = prendinBrowserUpdate;
			state.items = result.items;

			Dispatcher.dispatch({
				actionType: Constants.BROWSER_SELECT_ITEM,
				state: state,
			});
		});
	},

};