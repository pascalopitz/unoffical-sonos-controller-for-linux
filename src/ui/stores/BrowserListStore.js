import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants from '../constants/Constants'

const CHANGE_EVENT = 'change';

// const START_STATE = {
// 	source: null,
// 	searchType: null,
// 	headline: 'Select a Music Source',
// 	items: [
// 		{
// 			title: 'Sonos Favourites',
// 			source: 'favourites'
// 		},
// 		{
// 			title: 'Music Library',
// 			source: 'library'
// 		}
// 	]
// };

const LIBRARY_STATE = {
	headline: 'Browse Music Library',
	source: 'library',
	items: [
		{
			title: 'Artists',
			searchType: 'A:ARTIST'
		},
		{
			title: 'Albums',
			searchType: 'A:ALBUM'
		},
		{
			title: 'Composers',
			searchType: 'A:COMPOSER'
		},
		{
			title: 'Genres',
			searchType: 'A:GENRE'
		},
		{
			title: 'Tracks',
			searchType: 'A:TRACKS'
		},
		{
			title: 'Playlists',
			searchType: 'A:PLAYLISTS'
		}
	]
};

var BrowserListStore = _.assign({}, events.EventEmitter.prototype, {

	_state : LIBRARY_STATE,
	_history: [],

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	getState () {
		return this._state;
	},

	setState (state) {
		this._state = state;
	},

	addToHistory (state) {
		this._history.push(state);
	},

	getHistory () {
		return this._history;
	},

});


Dispatcher.register(action => {
	switch (action.actionType) {

		case Constants.BROWSER_BACK:
			if(BrowserListStore._history.length) {
				let state = BrowserListStore._history.pop();
				BrowserListStore.setState(state);
				BrowserListStore.emitChange();
			}
			break;

		case Constants.BROWSER_SCROLL_RESULT:
			BrowserListStore.setState(action.state);
			BrowserListStore.emitChange();
			break;

		case Constants.BROWSER_SELECT_ITEM:
			BrowserListStore.addToHistory(BrowserListStore.getState());
			BrowserListStore.setState(action.state);
			BrowserListStore.emitChange();
			break;
	}
});

export default BrowserListStore;

