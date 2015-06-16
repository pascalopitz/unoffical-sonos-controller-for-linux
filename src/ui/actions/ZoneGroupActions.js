import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/Constants'

import SonosService  from '../services/SonosService'

export default {

	selectGroup(group) {

		let zone = _(group).findWhere({
			coordinator: 'true'
		});

		SonosService.selectCurrentZone(zone);

		Dispatcher.dispatch({
			actionType: Constants.ZONE_GROUP_SELECT,
			zone: zone
		});

		SonosService.queryState();
	},

};