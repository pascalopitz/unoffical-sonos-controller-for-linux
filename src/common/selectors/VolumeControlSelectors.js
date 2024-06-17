import map from 'lodash/map';
import sum from 'lodash/sum';
import filter from 'lodash/filter';
import values from 'lodash/values';

import { createSelector } from 'reselect';
import { URL } from 'url';

export function getPlayers(state) {
    const { muted, volume } = state.volume;
    const { zones, currentGroup } = state.sonosService;

    if (!zones.length) {
        return [];
    }

    const matches = zones.filter((z) => z.ID === currentGroup);

    const [current] = matches.length ? matches : zones;
    const members = current.ZoneGroupMember;

    const players = members.reduce((prev, member) => {
        const uri = new URL(member.Location);
        const host = uri.hostname;
        const port = parseInt(uri.port);

        return {
            ...prev,
            [host]: {
                host,
                port,
                group: current.ID,
                name: member.ZoneName,
                muted: muted[host] || false,
                volume: volume[host] || 0,
            },
        };
    }, {});

    return players;
}

export const getCurrentGroupKeys = createSelector(getPlayers, (players) =>
    map(players, (p) => p.host),
);

export const getGroupMuted = createSelector(
    getPlayers,
    (players) =>
        filter(players, {
            muted: false,
        }).length === 0,
);

export const getGroupVolume = createSelector(getPlayers, (playersMap) => {
    const players = values(playersMap);

    if (!players.length) {
        return 0;
    }

    const volume = Math.floor(
        sum(map(players, (p) => Number(p.volume))) / players.length,
    );
    return volume;
});
