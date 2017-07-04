import events from 'events';
import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

const CHANGE_EVENT = 'change';

const CurrentTrackStore = _.assign({}, events.EventEmitter.prototype, {
    _currentTrack: null,
    _nextTrack: null,
    _expanded: true,

    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener(listener) {
        this.on(CHANGE_EVENT, listener);
    },

    getCurrentTrack() {
        return this._currentTrack;
    },

    setCurrentTrack(info) {
        this._currentTrack = info;
    },

    getNextTrack() {
        return this._nextTrack;
    },

    setNextTrack(info) {
        this._nextTrack = info;
    },

    getExpanded() {
        return this._expanded;
    },

    setExpanded(expanded) {
        this._expanded = expanded;
    }
});

Dispatcher.register(action => {
    switch (action.actionType) {
        case Constants.SONOS_SERVICE_CURRENT_TRACK_UPDATE:
            if (
                action.track.class === 'object.item' &&
                action.avTransportMeta
            ) {
                CurrentTrackStore.setCurrentTrack({
                    title: action.avTransportMeta.title,
                    albumArtURI: action.track.albumArtURI
                });
            } else {
                CurrentTrackStore.setCurrentTrack(action.track);
            }
            CurrentTrackStore.emitChange();
            break;

        case Constants.SONOS_SERVICE_NEXT_TRACK_UPDATE:
            CurrentTrackStore.setNextTrack(action.track);
            CurrentTrackStore.emitChange();
            break;

        case Constants.ZONE_GROUP_SELECT:
            CurrentTrackStore.setCurrentTrack(null);
            CurrentTrackStore.setNextTrack(null);
            CurrentTrackStore.emitChange();
            break;

        case Constants.CURRENT_TRACK_TOGGLE_EXPANDED:
            CurrentTrackStore.setExpanded(action.expanded);
            CurrentTrackStore.emitChange();
            break;
    }
});

export default CurrentTrackStore;
