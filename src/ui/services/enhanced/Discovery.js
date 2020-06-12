import { DeviceDiscovery } from 'sonos';

import SonosEnhanced from './SonosEnhanced';

export async function discoverMultiple(options = { timeout: 10000 }) {
    return new Promise((resolve, reject) => {
        const discovery = DeviceDiscovery(options);
        const devices = [];
        discovery.on('DeviceAvailable', async (device, model) => {
            const sonos = new SonosEnhanced(device.host, model);
            await sonos.initialise();
            devices.push(sonos);
        });

        discovery.once('timeout', () => {
            if (devices.length > 0) {
                resolve(devices);
            } else {
                reject(new Error('No devices found'));
            }
        });
    });
}
