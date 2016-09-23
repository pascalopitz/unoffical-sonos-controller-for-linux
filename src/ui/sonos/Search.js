import Sonos from './Sonos';
import dgram from 'dgram';

import ip from './helpers/ip';

const SONOS_UPNP_BROADCAST_IP = '239.255.255.250';
const SONOS_UPNP_BROADCAST_PORT = 1900;
const SONOS_UPNP_RECEIVE_PORT = 1905;

class Search {

	constructor (discoveryCallback, options={}) {

		var self = this;

		this.foundSonosDevices = {};

		var PLAYER_SEARCH = new Buffer(['M-SEARCH * HTTP/1.1',
		'HOST: 239.255.255.250:reservedSSDPport',
		'MAN: ssdp:discover',
		'MX: 1',
		'ST: urn:schemas-upnp-org:device:ZonePlayer:1'].join('\r\n'));


		var sendDiscover = function () {
			['239.255.255.250', '255.255.255.255'].map(function (addr) {
				self.socket.send(PLAYER_SEARCH, 0, PLAYER_SEARCH.length, SONOS_UPNP_BROADCAST_PORT, addr);
			});
			// Periodically send discover packet to find newly added devices
			self.pollTimer = setTimeout(sendDiscover, 10000)
		}

		this.socket = dgram.createSocket('udp4', function (buffer, rinfo) {
			buffer = buffer.toString();

			if (buffer.match(/.+Sonos.+/)) {
				var modelCheck = buffer.match(/SERVER.*\((.*)\)/);
				var model = (modelCheck.length > 1 ? modelCheck[1] : null);
				var addr = rinfo.address;

				if (!(addr in self.foundSonosDevices)) {
					let sonos = self.foundSonosDevices[addr] = new Sonos(addr, null, model);
					discoveryCallback(sonos);
				}
			}
		});

		this.socket.on('error', function (err) {
			self.emit('error', err)
		});

		this.socket.bind(options, function () {
			self.socket.setBroadcast(true);
			sendDiscover();
		});

		if (options.timeout) {
			self.searchTimer = setTimeout(function () {
				self.socket.close()
				self.emit('timeout')
			}, options.timeout);
		}
	}

	destroy () {
		this.server.close();
	}
};

export default Search;
