import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

export default {
	toggleExpanded (expanded) {
		Dispatcher.dispatch({
			actionType: Constants.CURRENT_TRACK_TOGGLE_EXPANDED,
			expanded: expanded,
		});
	}
};
