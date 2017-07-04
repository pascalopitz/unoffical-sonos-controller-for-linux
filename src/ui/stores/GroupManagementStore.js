import events from 'events';
import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

import ZoneGroupStore from '../stores/ZoneGroupStore';

const CHANGE_EVENT = 'change';

const GroupManagementStore = _.assign({}, events.EventEmitter.prototype, {
    _current: null,
    _players: null,

    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener(listener) {
        this.on(CHANGE_EVENT, listener);
    },

    setCurrent(group) {
        this._current = group;
    },

    getCurrent() {
        return this._current;
    },

    setPlayers(players) {
        this._players = players;
    },

    getPlayers() {
        return this._players;
    }
});

Dispatcher.register(action => {
    switch (action.actionType) {
        case Constants.ZONE_GROUP_MANAGEMENT_SHOW:
        case Constants.GROUP_MANAGEMENT_SHOW:
            {
                const groupID = action.group[0].group;
                const zones = _.cloneDeep(ZoneGroupStore.getAll());
                const players = _.reduce(
                    zones,
                    (res, item) => {
                        return res.concat(item);
                    },
                    []
                );

                players.forEach(p => {
                    if (p.group === groupID) {
                        p.selected = true;
                    }
                });

                GroupManagementStore.setPlayers(players);
                GroupManagementStore.setCurrent(action.group);
                GroupManagementStore.emitChange();
            }
            break;

        case Constants.GROUP_MANAGEMENT_CHANGED:
        case Constants.GROUP_MANAGEMENT_HIDE:
            GroupManagementStore.setPlayers(null);
            GroupManagementStore.setCurrent(null);
            GroupManagementStore.emitChange();
            break;

        case Constants.GROUP_MANAGEMENT_SELECT:
            {
                const players = GroupManagementStore.getPlayers();

                players.forEach(p => {
                    if (p.uuid === action.player.uuid) {
                        p.selected = true;
                    }
                });

                GroupManagementStore.setPlayers(players);
                GroupManagementStore.emitChange();
            }
            break;

        case Constants.GROUP_MANAGEMENT_DESELECT:
            {
                const players = GroupManagementStore.getPlayers();
                const selectCount = _.filter(players, { selected: true })
                    .length;

                if (selectCount === 1) {
                    return;
                }

                players.forEach(p => {
                    if (p.uuid === action.player.uuid) {
                        p.selected = false;
                    }
                });

                GroupManagementStore.setPlayers(players);
                GroupManagementStore.emitChange();
            }
            break;
    }
});

export default GroupManagementStore;
