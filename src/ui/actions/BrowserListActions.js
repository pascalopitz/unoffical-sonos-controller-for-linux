"use strict";

import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService from '../services/SonosService';

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
