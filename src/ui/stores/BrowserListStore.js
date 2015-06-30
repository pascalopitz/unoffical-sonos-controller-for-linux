"use strict";

import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

const CHANGE_EVENT = 'change';

const START_STATE = {
	source: null,
	searchType: null,
	title: 'Select a Music Source',
	items: [
		{
			title: 'Sonos Favourites',
			searchType: 'FV:2'
		},
		{
			title: 'Music Library',
			action: 'library'
		},
		{
			title: 'Sonos Playlists',
			searchType: 'SQ:'
		},
		{
			title: 'Line-in',
			action: 'linein'
		}
	]
};

const LIBRARY_STATE = {
	title: 'Browse Music Library',
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

const DEFAULT_SEARCH_TARGET = 'artists';

var BrowserListStore = _.assign({}, events.EventEmitter.prototype, {

	LIBRARY_STATE: LIBRARY_STATE,
	_state : START_STATE,
	_search :  false,
	_searchResults :  null,
	_searchTarget :  DEFAULT_SEARCH_TARGET,
	_history: [],

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	isSearching () {
		return this._search;
	},

	startSearch () {
		this._search = true;
	},

	endSearch () {
		this._search = false;
	},

	getSearchMode () {
		return this._searchTarget;
	},

	setSearchResults (results) {
		this._searchResults = results;
	},

	getState () {
		if(this._search && this._history.length === 0) {
			return this._searchResults[this._searchTarget];
		}
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

		case Constants.SEARCH:
			if(!action.term) {
				BrowserListStore._history = [];
				BrowserListStore.endSearch();
				BrowserListStore.setSearchResults(null);
				BrowserListStore._searchTarget = DEFAULT_SEARCH_TARGET;
				BrowserListStore.setState(START_STATE);
			} else {
				BrowserListStore._history = [];
				BrowserListStore.startSearch();
				BrowserListStore.setSearchResults(action.results);
			}

			BrowserListStore.emitChange();
			break;

		case Constants.BROWSER_CHANGE_SEARCH_MODE:
			BrowserListStore._searchTarget = action.mode;
			BrowserListStore.emitChange();
			break;

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
