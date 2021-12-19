import sortBy from 'lodash/sortBy';

export function getPlayers(state) {
    const players = state.sonosService.zones.reduce((prev, z) => {
        const members = z.ZoneGroupMember.map((m) => {
            const uri = new URL(m.Location);
            const host = uri.hostname;
            const port = parseInt(uri.port);
            const _sonos = state.sonosService.deviceSearches[host];
            const model = _sonos.model;

            return {
                ...m,
                host,
                port,
                model,
                inGroup: z.ID,
                isCoordinator: z.Coordinator === m.UUID,
            };
        });

        return [...prev, ...members];
    }, []);

    return sortBy(players, 'ZoneName');
}
