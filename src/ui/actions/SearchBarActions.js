"use strict";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService from '../services/SonosService';

import BrowserListStore from '../stores/BrowserListStore';

function createSearchPromise(type, term, options) {
	return new Promise((resolve, reject) => {
		term = escape(term);

		let sonos = SonosService._currentDevice;
		sonos.searchMusicLibrary(type, term, options || {}, (err, result) => {

			if(err) {
				resolve({
					returned: 0,
					total: 0,
					items: []
				});
				return;
			}

			resolve(result);
		});
	});
}

function transformSMAPI(res, client) {
	let items = [];

	if(res.mediaMetadata) {
		res.mediaMetadata.forEach((i) => {
			i.serviceClient = client;
			items[i.$$position] =  i;
		})
	}

	if(res.mediaCollection) {
		res.mediaCollection.forEach((i) => {
			i.serviceClient = client;
			items[i.$$position] =  i;
		})
	}

	return {
		returned: res.count,
		total: res.total,
		items: items
	};
}

export default {

	term: null,

	search (term) {

		this.term = term;

		if(!term || !term.length) {
			Dispatcher.dispatch({
				actionType: Constants.SEARCH,
				term: null,
			});
			return;
		}

		let currentState = BrowserListStore.getState();

		if(currentState.serviceClient) {

			let client = currentState.serviceClient;

			Promise.all([
				client.search('album', term),
				client.search('artist', term),
				client.search('track', term),
			]).then((res) => {

				if(this.term !== term) {
					return;
				};

				Dispatcher.dispatch({
					actionType: Constants.SEARCH,
					term: term,
					results: {
						albums: transformSMAPI(res[0], client),
						artists:  transformSMAPI(res[1], client),
						tracks:  transformSMAPI(res[2], client),
					},
				});
			}, () => {
				//debugger;
			});

		} else {

			Promise.all([
				createSearchPromise('albums', term),
				createSearchPromise('albumArtists', term),
				createSearchPromise('tracks', term),
			]).then((res) => {

				if(this.term !== term) {
					return;
				};

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
			});
		}

	},

};
