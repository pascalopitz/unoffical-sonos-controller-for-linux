import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService from '../services/SonosService'

function createSearchPromise(type, term, options) {
	return new Promise((resolve, reject) => {
		let sonos = SonosService._currentDevice;
		sonos.searchMusicLibrary(type, term, options || {}, (err, result) => {

			if(err) {
				reject(err);
				return;
			}

			resolve(result);
		});
	})
}

export default {

	search (term) {

		if(!term || !term.length) {
			Dispatcher.dispatch({
				actionType: Constants.SEARCH,
				term: null,
			});

		}

		Promise.all([
			createSearchPromise('albums', term),
			createSearchPromise('artists', term),
			createSearchPromise('tracks', term),
		]).then((res) => {

			Dispatcher.dispatch({
				actionType: Constants.SEARCH,
				term: term,
				results: { 
					albums: res[0],
					artists: res[1],
					tracks: res[2]
				},
			});
		}, () => {
			//debugger;
		})
	},

};