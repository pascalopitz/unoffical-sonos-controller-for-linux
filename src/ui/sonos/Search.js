import Sonos from './Sonos';
import dgram from 'dgram';

const SONOS_UPNP_BROADCAST_IP = '239.255.255.250';
const SONOS_UPNP_BROADCAST_PORT = 1900;
const SONOS_UPNP_RECEIVE_PORT = 1905;

class Search {
    constructor(
        discoveryCallback,
        options = { port: SONOS_UPNP_RECEIVE_PORT }
    ) {
        const self = this;

        this.foundSonosDevices = {};

        const PLAYER_SEARCH = Buffer.from(
            [
                'M-SEARCH * HTTP/1.1',
                'HOST: ' + SONOS_UPNP_BROADCAST_IP + ':reservedSSDPport',
                'MAN: ssdp:discover',
                'MX: 1',
                'ST: urn:schemas-upnp-org:device:ZonePlayer:1'
            ].join('\r\n')
        );

        function sendDiscover() {
            [SONOS_UPNP_BROADCAST_IP, '255.255.255.255'].map(function(addr) {
                self.socket.send(
                    PLAYER_SEARCH,
                    0,
                    PLAYER_SEARCH.length,
                    SONOS_UPNP_BROADCAST_PORT,
                    addr
                );
            });
            // Periodically send discover packet to find newly added devices
            self.pollTimer = setTimeout(sendDiscover, 10000);
        }

        this.socket = dgram.createSocket('udp4', function(buffer, rinfo) {
            buffer = buffer.toString();

            if (buffer.match(/.+Sonos.+/)) {
                const modelCheck = buffer.match(/SERVER.*\((.*)\)/);
                const model = modelCheck.length > 1 ? modelCheck[1] : null;
                const addr = rinfo.address;

                if (!(addr in self.foundSonosDevices)) {
                    const sonos = (self.foundSonosDevices[addr] = new Sonos(
                        addr,
                        null,
                        model
                    ));
                    discoveryCallback(sonos);
                }
            }
        });

        this.socket.on('error', function(err) {
            console.error('error', err);
        });

        this.socket.bind(options, function() {
            // From: https://github.com/jishi/node-sonos-discovery/blob/94504305526f70b88a38e0e57b5be897a2b376dd/lib/sonos-ssdp.js
            // This allows discovery through one router hop in a vlan environment
            self.socket.setMulticastTTL(2);
            // We set this in order to send 255.255.255.255 discovery requests. Doesn't matter for SSDP endpoint
            self.socket.setBroadcast(true);

            sendDiscover();
        });

        if (options.timeout) {
            self.searchTimer = setTimeout(function() {
                self.socket.close();
                self.emit('timeout');
            }, options.timeout);
        }
    }

    destroy() {
        this.socket.close();
    }
}

export default Search;
