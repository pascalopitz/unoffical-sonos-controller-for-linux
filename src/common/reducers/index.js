import { createStore, combineReducers, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';

import SonosServiceReducer from './SonosServiceReducer';
import GroupManagementReducer from './GroupManagementReducer';
import CurrentTrackReducer from './CurrentTrackReducer';
import VolumeControlReducer from './VolumeControlReducer';
import QueueReducer from './QueueReducer';
import BrowserListReducer from './BrowserListReducer';
import MusicServicesReducer from './MusicServicesReducer';
import PlaylistReducer from './PlaylistReducer';
import EqReducer from './EqReducer';

const appReducer = combineReducers({
    sonosService: SonosServiceReducer,
    groupManagement: GroupManagementReducer,
    currentTrack: CurrentTrackReducer,
    volume: VolumeControlReducer,
    queue: QueueReducer,
    browserList: BrowserListReducer,
    musicServices: MusicServicesReducer,
    playlists: PlaylistReducer,
    eq: EqReducer,
});

const ensureResolvedMiddleware = () => (next) => async (action) => {
    const payload = await action.payload;

    next({
        ...action,
        payload,
    });
};

const getStateMiddleware = (store) => (next) => (action) => {
    next({ ...action, getState: store.getState });
};

const catcherMiddleware = () => (next) => (action) => {
    const payload =
        action.payload instanceof Promise
            ? action.payload.catch((err) => {
                  console.error(err);
                  throw err;
              })
            : action.payload;

    next({
        ...action,
        payload,
    });
};

export default createStore(
    appReducer,
    applyMiddleware(
        catcherMiddleware,
        promiseMiddleware,
        ensureResolvedMiddleware,
        getStateMiddleware,
    ),
);
