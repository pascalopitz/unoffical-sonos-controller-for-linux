import bb from 'bluebird';
import Registry from './Services';

const services = {};

export default function serviceFactory(name, sonos) {
    if (!services[sonos.host]) {
        services[sonos.host] = {};
    }

    if (services[sonos.host][name]) {
        return services[sonos.host][name];
    }

    const service = new Registry[name](sonos.host, sonos.port);
    bb.promisifyAll(service);
    services[sonos.host][name] = service;
    return service;
}
