import Sonos from './Sonos';

const SONOS_UPNP_BROADCAST_PORT = 1900;
const SONOS_UPNP_RECEIVE_PORT = 1901;

var socketReceive;

chrome.sockets.udp.onReceive.addListener(function () {
	if(socketReceive) {
		socketReceive.apply(null, arguments);
	}
});

class Search {

	constructor (discoveryCallback) {

		var self = this;

		var encoder = new TextEncoder();
		var decoder = new TextDecoder();

		var PLAYER_SEARCH = encoder.encode(['M-SEARCH * HTTP/1.1',
		'HOST: 239.255.255.250:reservedSSDPport',
		'MAN: ssdp:discover',
		'MX: 1',
		'ST: urn:schemas-upnp-org:device:ZonePlayer:1'].join('\r\n'));

		chrome.sockets.udp.create({
			name: 'SonosControllerForChrome-UDP'
		}, function (info) {

			self.socketId = info.socketId;

			chrome.sockets.udp.bind(info.socketId, "0.0.0.0", SONOS_UPNP_RECEIVE_PORT, function (bindResult) {

				if(bindResult < 0) {
					throw new Error('could not bind socket');
				}

				chrome.sockets.udp.send(info.socketId, PLAYER_SEARCH.buffer, '239.255.255.250', SONOS_UPNP_BROADCAST_PORT, function socketResponse (sendInfo) {
					//console.log(sendInfo);
				});

			});

			socketReceive = function(receiveInfo) {

				if(receiveInfo.socketId === info.socketId) {

					var buffer = decoder.decode(new DataView(receiveInfo.data));

					if(buffer.match(/.+Sonos.+/)) {
						var modelCheck = buffer.match(/SERVER.*\((.*)\)/);
						var model = (modelCheck.length > 1 ? modelCheck[1] : null);

						discoveryCallback(new Sonos(receiveInfo.remoteAddress))
					}
				}

			};

		});
	}

	destroy () {
		chrome.sockets.udp.close(this.socketId, function () {
			console.log('socket cleaned up');
		});
	}
};

export default Search;
