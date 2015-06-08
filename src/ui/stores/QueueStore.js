import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const CHANGE_EVENT = 'change';

var QueueStore = _.assign({}, events.EventEmitter.prototype, {

	_tracks : [],

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	setTracks (tracks) {
		this._tracks = tracks || [];
	},

	getTracks () {
		return this._tracks;
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {
		case Constants.SONOS_SERVICE_QUEUE_UPDATE:
			QueueStore.setTracks(action.result.items);
			QueueStore.emitChange();
			break;
	}
});

export default QueueStore;

