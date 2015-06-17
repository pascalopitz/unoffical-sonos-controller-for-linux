"use strict";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService  from '../services/SonosService'

export default {

	selectGroup(group) {

		SonosService.selectCurrentZone(group);

		Dispatcher.dispatch({
			actionType: Constants.ZONE_GROUP_SELECT,
			group: group
		});

		SonosService.queryState();
	},

};