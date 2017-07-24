import _ from 'lodash';
import xml2json from 'jquery-xml2json';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

import SonosService from '../services/SonosService';
import Services from '../sonos/helpers/Services';

export default {
    showManagement() {
        const sonos = SonosService._currentDevice;
        const alarmClock = new Services.AlarmClock(sonos.host, sonos.port);

        alarmClock.ListAlarms(null, (err, resp) => {
            const currentAlarmList = xml2json(_.get(resp, 'CurrentAlarmList'));

            const alarms = _(currentAlarmList)
                .get('Alarms.Alarm')
                .map(a => a.$);

            Dispatcher.dispatch({
                actionType: Constants.ALARM_MANAGEMENT_SHOW,
                alarms
            });
        });
    },

    hideManagement() {
        Dispatcher.dispatch({
            actionType: Constants.ALARM_MANAGEMENT_HIDE
        });
    },

    editAlarm(alarm) {
        Dispatcher.dispatch({
            actionType: Constants.ALARM_MANAGEMENT_EDIT,
            alarm
        });
    }
};
