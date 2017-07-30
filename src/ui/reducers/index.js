import { createStore, combineReducers, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';

import SonosServiceReducer from './SonosServiceReducer';
import GroupManagementReducer from './GroupManagementReducer';
import CurrentTrackReducer from './CurrentTrackReducer';
import PlayerReducer from './PlayerReducer';
import VolumeControlReducer from './VolumeControlReducer';
import QueueReducer from './QueueReducer';

const appReducer = combineReducers({
    sonosService: SonosServiceReducer,
    groupManagement: GroupManagementReducer,
    currentTrack: CurrentTrackReducer,
    player: PlayerReducer,
    volume: VolumeControlReducer,
    queue: QueueReducer
});

const getStateMiddleware = store => next => action => {
    next({ ...action, getState: store.getState });
};

export default createStore(
    appReducer,
    applyMiddleware(promiseMiddleware, getStateMiddleware)
);
