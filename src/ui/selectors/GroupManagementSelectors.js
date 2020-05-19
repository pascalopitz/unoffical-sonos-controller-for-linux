import _ from 'lodash';

export function getPlayers(state) {
    const players = state.sonosService.zones.reduce((prev, z) => {
        const members = z.ZoneGroupMember.map((m) => {
            const uri = new URL(m.Location);
            const host = uri.hostname;
            const port = parseInt(uri.port);

            return {
                ...m,
                host,
                port,
                inGroup: z.ID,
                isCoordinator: z.Coordinator === m.ID,
            };
        });

        return [...prev, ...members];
    }, []);

    return _(players).sortBy('ZoneName').value();
}
