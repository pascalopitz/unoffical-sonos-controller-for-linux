import events from 'events';
import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

const CHANGE_EVENT = 'change';

const ZoneGroupStore = _.assign({}, events.EventEmitter.prototype, {
    _groups: [],
    _playStates: {},
    _current: null,

    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener(listener) {
        this.on(CHANGE_EVENT, listener);
    },

    setAll(groups) {
        this._groups = _(groups)
            .reject(function(z) {
                return z.name.toLocaleLowerCase().match('bridge');
            })
            .reject(function(z) {
                return z.name.toLocaleLowerCase().match('boost');
            })
            .sortBy('name')
            .groupBy('group')
            .value();
    },

    setPlayState(host, state, track) {
        this._playStates[host] = {
            track: track,
            isPlaying: state === 'playing'
        };
    },

    getPlayStates() {
        return this._playStates;
    },

    getAll() {
        return this._groups;
    },

    setCurrent(group) {
        this._current = group;
    },

    getCurrent() {
        return this._current;
    }
});

Dispatcher.register(action => {
    switch (action.actionType) {
        case Constants.SONOS_SERVICE_TOPOLOGY_EVENT:
        case Constants.SONOS_SERVICE_TOPOLOGY_UPDATE:
            ZoneGroupStore.setAll(action.groups);
            ZoneGroupStore.emitChange();
            break;

        case Constants.ZONE_GROUP_SELECT:
        case Constants.SONOS_SERVICE_ZONEGROUPS_DEFAULT:
            ZoneGroupStore.setCurrent(action.zone);
            ZoneGroupStore.emitChange();
            break;

        case Constants.SONOS_SERVICE_ZONEGROUP_TRACK_UPDATE:
            let trackInfo = action.track;

            if (trackInfo.class === 'object.item' && !action.avTransportMeta) {
                // skip because it's radio with no meta, so garbage
                return;
            }

            if (trackInfo.class === 'object.item' && action.avTransportMeta) {
                trackInfo = {
                    title: action.avTransportMeta.title,
                    albumArtURI: action.track.albumArtURI
                };
            }

            ZoneGroupStore.setPlayState(action.host, action.state, trackInfo);
            ZoneGroupStore.emitChange();
            break;
    }
});

export default ZoneGroupStore;
