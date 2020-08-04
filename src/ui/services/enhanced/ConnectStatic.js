import SonosEnhanced from './SonosEnhanced';

export async function connectStatic(hosts, port = 1400) {
    const players = [];
    for (const host of hosts) {
        //model is not really used anywhere, let's ignore it for now
        let sonosEnhanced = new SonosEnhanced(host, null);
        await sonosEnhanced.initialise();
        players.push(sonosEnhanced);
    }
    return players;
}
