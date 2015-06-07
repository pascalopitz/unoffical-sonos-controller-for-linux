import Dispatcher from '../dispatcher/AppDispatcher'
import Constants  from '../constants/ZoneGroupConstants'

export default {

	setGroups(groups) {
		Dispatcher.dispatch({
			actionType: Constants.ZONE_GROUP_SET,
			groups: groups
		});
	},

	selectGroup(group) {
		Dispatcher.dispatch({
			actionType: Constants.ZONE_GROUP_SELECT,
			group: group
		});
	},

};