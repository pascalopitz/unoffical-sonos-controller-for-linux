import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

const CHANGE_EVENT = 'change';

var ZoneGroupStore = _.assign({}, events.EventEmitter.prototype, {

	_groups : [],
	_current : null,

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	setAll (groups) {
		this._groups = _(groups).groupBy('group').value();
	},

	getAll () {
		return this._groups;
	},

	setCurrent (group) {
		console.log(group);
		this._current = group;
	},

	getCurrent () {
		return this._current;
	},
});

Dispatcher.register(action => {
	switch (action.actionType) {

		case Constants.SONOS_SERVICE_TOPOLOGY_UPDATE:
			ZoneGroupStore.setAll(action.groups);
			ZoneGroupStore.emitChange();		
			break;

		// case Constants.SONOS_SERVICE_ZONEGROUPS_UPDATE:
		// 	ZoneGroupStore.setAll(action.groups);
		// 	ZoneGroupStore.emitChange();
		// 	break;

		case Constants.ZONE_GROUP_SELECT:
		case Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT:
			ZoneGroupStore.setCurrent(action.zone);
			ZoneGroupStore.emitChange();
			break;
	}
});

export default ZoneGroupStore;

