import events from 'events';
import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

const CHANGE_EVENT = 'change';

const AlarmManagementStore = _.assign({}, events.EventEmitter.prototype, {
    visibility: false,
    alarms: null,

    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener(listener) {
        this.on(CHANGE_EVENT, listener);
    },

    setVisibility(visibility) {
        this.visibility = visibility;
    },

    setAlarms(alarms) {
        this.alarms = alarms;
    },

    setCurrentAlarm(alarm) {
        this.currentAlarm = alarm;
    }
});

Dispatcher.register(action => {
    switch (action.actionType) {
        case Constants.ALARM_MANAGEMENT_EDIT:
            {
                AlarmManagementStore.setCurrentAlarm(action.alarm);
                AlarmManagementStore.emitChange();
            }
            break;

        case Constants.ALARM_MANAGEMENT_SHOW:
            {
                AlarmManagementStore.setAlarms(action.alarms);
                AlarmManagementStore.setVisibility(true);
                AlarmManagementStore.emitChange();
            }
            break;

        case Constants.ALARM_MANAGEMENT_HIDE:
            {
                AlarmManagementStore.setAlarms(null);
                AlarmManagementStore.setCurrentAlarm(null);
                AlarmManagementStore.setVisibility(false);
                AlarmManagementStore.emitChange();
            }
            break;
    }
});

export default AlarmManagementStore;
