import _ from 'lodash';
import { createSelector } from 'reselect';

export function getPlayers(state) {
    const { muted, volume } = state.volume;
    const { zones, currentGroup } = state.sonosService;
    const members = zones.filter(z => z.group === currentGroup);

    const players = {};

    for (const member of members) {
        const host = member.host;
        players[host] = {
            host,
            group: member.group,
            name: member.name,
            muted: muted[host] || false,
            volume: volume[host] || 0
        };
    }

    return players;
}

export function getCurrentGroupKeys(state) {
    const { currentGroup, zones } = state.sonosService;
    return _.filter(zones, z => z.group === currentGroup).map(p => p.host);
}

export const getGroupMuted = createSelector(
    getPlayers,
    players =>
        _.filter(players, {
            muted: false
        }).length === 0
);

export const getGroupVolume = createSelector(
    getPlayers,
    playersMap => {
        const players = _.values(playersMap);

        if (!players.length) {
            return 0;
        }

        const volume = Math.floor(
            _.sum(_.map(players, p => Number(p.volume))) / players.length
        );
        return volume;
    }
);
