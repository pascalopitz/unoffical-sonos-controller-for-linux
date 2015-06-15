import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const CHANGE_EVENT = 'change';

var QueueStore = _.assign({}, events.EventEmitter.prototype, {

	_tracks : [],
	_position: null,

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	setPosition (pos) {
		this._position = Number(pos);
	},

	getPosition (pos) {
		return this._position;
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
		case Constants.SONOS_SERVICE_POSITION_INFO_UPDATE:
			QueueStore.setPosition(action.info.Track);
			QueueStore.emitChange();
			break;

		case Constants.SONOS_SERVICE_QUEUE_UPDATE:
			QueueStore.setTracks(action.result.items);
			QueueStore.emitChange();
			break;

		case Constants.ZONE_GROUP_SELECT:
			QueueStore.setTracks(null);
			QueueStore.emitChange();
			break;
	}
});

export default QueueStore;

