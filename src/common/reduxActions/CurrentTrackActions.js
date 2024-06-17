import { createAction } from 'redux-actions';
import Constants from '../constants';

export const toggleExpanded = createAction(
    Constants.CURRENT_TRACK_TOGGLE_EXPANDED,
);
