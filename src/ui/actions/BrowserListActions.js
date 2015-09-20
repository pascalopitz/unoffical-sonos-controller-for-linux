"use strict";

import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService from '../services/SonosService';
import MusicServiceClient from '../services/MusicServiceClient';

import QueueStore from '../stores/QueueStore';
import BrowserListStore from '../stores/BrowserListStore';

export default {

	back () {
		Dispatcher.dispatch({
			actionType: Constants.BROWSER_BACK,
		});
	},

	home () {
		Dispatcher.dispatch({
			actionType: Constants.BROWSER_HOME,
		});
	},

	more (state) {
		let sonos = SonosService._currentDevice;
		let params = {
			start: state.items.length
		};

		sonos.getMusicLibrary(state.id || state.searchType, params, (err, result) => {
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

		if(item.metadata && item.metadata.class === 'object.item.audioItem.audioBroadcast') {
			sonos.play({
				uri: item.uri,
				metadata: item.metadataRaw,
			}, () => {
				SonosService.queryState(sonos);
			});
		} else if(item.class && item.class === 'object.item.audioItem') {
			sonos.play(item.uri, () => {
				SonosService.queryState(sonos);
			});
		} else {
			sonos.getMusicLibrary('queue', {total: 0}, (err, res) => {
				if(err) {
					return;
				}

				let pos = 1;
				if(res.total) {
					pos = Number(res.total) + 1;
				}
				sonos.queue(item, () => {
					sonos.goto(pos, () => {
						sonos.play(() => {
							SonosService.queryState(sonos);
						});
					});
				});
			});
		}
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

	_fetchLineIns () {
		let promises = [];

		Object.keys(SonosService._deviceSearches).forEach((host) => {
			promises.push(new Promise((resolve, reject) => {
				let sonos = SonosService._deviceSearches[host];

				sonos.getMusicLibrary('AI:', {}, (err, result) => {
					let items = (result && result.items) ? result.items : [];

					if(items.length === 0) {
						resolve(items);
						return;
					}

					sonos.getZoneAttrs((err1, data) => {
						items.forEach((i) => {
							i.title = i.title + ': ' + data.CurrentZoneName;
						});
						resolve(items);
					});
				})
			}));
		});

		return Promise.all(promises).then((arr) => {
			return _.flatten(arr);
		});
	},

	_fetchMusicServices () {
		let sonos = SonosService._currentDevice;

		let promise= new Promise((resolve, reject) => {
			sonos.getAvailableServices((err, data) => {
				resolve(data.map((out) => {
					return {
						action: 'addService',
						title: out.Name,
						id: Number(out.Id),
						data: out,
					};
				}));
			});
		});

		return promise;
	},

	select (item) {

		let sonos = SonosService._currentDevice;
		let prendinBrowserUpdate;
		let objectId = item.searchType;

		if(item.action && item.action === 'library') {
			Dispatcher.dispatch({
				actionType: Constants.BROWSER_SELECT_ITEM,
				state: BrowserListStore.LIBRARY_STATE,
			});
			return;
		}

		if(item.action && item.action === 'linein') {
			this._fetchLineIns().then((results) => {
				let state = _.cloneDeep(item);
				state.items = results || [];

				Dispatcher.dispatch({
					actionType: Constants.BROWSER_SELECT_ITEM,
					state: state,
				});
			});
			return;
		}

		if(item.action && item.action === 'browseServices') {
			this._fetchMusicServices().then((results) => {
				let state = _.cloneDeep(item);
				state.items = results || [];

				Dispatcher.dispatch({
					actionType: Constants.BROWSER_SELECT_ITEM,
					state: state,
				});
			});
			return;
		}

		if(item.action && item.action === 'addService') {
			Dispatcher.dispatch({
				actionType: Constants.BROWSER_ADD_MUSICSERVICE,
				service: new MusicServiceClient(item.data)
			});
			return;
		}

		if(item.action && item.action === 'service') {
			let client = new MusicServiceClient(item.service.service);
			client.setAuthToken(item.service.authToken.authToken);
			client.setKey(item.service.authToken.privateKey);

			client.getMetadata('root', 0, 100)
				.then((res) => {
					let state = {
						title: client.name,
						items: res.mediaCollection.map((i) => {
							i.serviceClient = client;
							return i;
						}),
					};

					Dispatcher.dispatch({
						actionType: Constants.BROWSER_SELECT_ITEM,
						state: state,
					});
				});
			return;
		}


		if(item.serviceClient && item.itemType === 'track') {
			let client = item.serviceClient;

			client.getMediaURI(item.id, 0, 100)
				.then((res) => {
					console.log(res);
				});

			return;
		}

		if(item.serviceClient && item.itemType !== 'track') {
			let client = item.serviceClient;

			client.getMetadata(item.id, 0, 100)
				.then((res) => {
					let items = [];

					if(res.mediaMetadata) {
						items = res.mediaMetadata.map((i) => {
							i.serviceClient = client;
							return i;
						})
					}

					if(res.mediaCollection) {
						items = res.mediaCollection.map((i) => {
							i.serviceClient = client;
							return i;
						})
					}

					let state = {
						title: item.title,
						items: items,
					};

					Dispatcher.dispatch({
						actionType: Constants.BROWSER_SELECT_ITEM,
						state: state,
					});
				})

			return;
		}

		if(item.searchType) {
			prendinBrowserUpdate = {
				title : item.title,
				searchType : item.searchType
			};
		} else {
			prendinBrowserUpdate = item;
		}

		if(item.class) {
			objectId = (item.id) ? item.id : item.uri.split('#')[1];
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
