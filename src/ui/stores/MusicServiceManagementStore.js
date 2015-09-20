"use strict";

import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

const CHANGE_EVENT = 'change';

var MusicServiceManagementStore = _.assign({}, events.EventEmitter.prototype, {

	_client: null,

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	setClient (client) {
		this._client = client;
	},

	getClient () {
		return this._client;
	},

	setLink (link) {
		this._link = link;
	},

	getLink () {
		return this._link;
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {
		case Constants.BROWSER_ADD_MUSICSERVICE:
			MusicServiceManagementStore.setClient(action.service);
			MusicServiceManagementStore.emitChange();
			break;

		case Constants.MUSICSERVICE_ADD_CANCEL:
			MusicServiceManagementStore.setClient(null);
			MusicServiceManagementStore.setLink(null);
			MusicServiceManagementStore.emitChange();
			break;

		case Constants.MUSICSERVICE_ADD_LINK_RECEIVED:
			MusicServiceManagementStore.setLink(action.link);
			MusicServiceManagementStore.emitChange();
			break;
	}
});

export default MusicServiceManagementStore;
