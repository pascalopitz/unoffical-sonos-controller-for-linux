import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const CHANGE_EVENT = 'change';

var BrowserListStore = _.assign({}, events.EventEmitter.prototype, {

	_headline : [],
	_items : [],
	_history: [],

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	getItems () {
		return this._items;
	},

	getHeadline () {
		return this._headline;
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {
		// case Constants.BROWSER_:
		// 	BrowserListStore.setTracks(action.tracks);
		// 	BrowserListStore.emitChange();
		// 	break;
	}
});

export default BrowserListStore;

