import Search from './sonos/Search';
import Listener from './events/listener';

import xml2json from 'jquery-xml2json';

chrome.app.runtime.onLaunched.addListener(function() {

	var firstSonos;
	var uiPort;

	var deviceSearches = {};
	var listeners = {};
	var serviceEventHandlers = {};

	var reg = /^http:\/\/([\d\.]+)/; 

	chrome.runtime.onConnect.addListener(function(port) {

		console.log('port open', port);

		var currentSonos = null;
		var currentSubscriptions = [];

		function subscribeServiceEvents(sonos) {
			var x = listeners[sonos.host];

			x.addService('/ZoneGroupTopology/Event', function(error, sid) {
				if (error) throw err;
				currentSubscriptions.push(sid);
			});


			x.addService('/MediaRenderer/AVTransport/Event', function(error, sid) {
				if (error) throw err;
				currentSubscriptions.push(sid);
			});

			x.addService('/MediaRenderer/RenderingControl/Event', function(error, sid) {
				if (error) throw err;
				currentSubscriptions.push(sid);
			});

			x.addService('/MediaRenderer/GroupRenderingControl/Event', function(error, sid) {
				if (error) throw err;
				currentSubscriptions.push(sid);
			});

			x.addService('/MediaServer/ContentDirectory/Event', function(error, sid) {
				if (error) throw err;
				currentSubscriptions.push(sid);
			});
		}

		function unsubscribeServiceEvents(sonos) {
			var x = listeners[sonos.host];

			currentSubscriptions.forEach( function (sid) {
				x.removeService(sid, function(error) {
					if (error) throw err;
					console.log('Successfully unsubscribed');
				});
			});

			currentSubscriptions = [];
		}

		if(port.name === 'ui') {

			uiPort = port;

			port.onDisconnect.addListener(function () {
				unsubscribeServiceEvents(currentSonos);
				uiPort = null;					
			});

			port.onMessage.addListener(function(msg) {
				// handle messages

				console.log('message: ', msg);

				function queryState(sonos) {
					sonos.getVolume(function (err, vol) {
		 				uiPort.postMessage({ type: 'volume', state: vol, host: sonos.host, port: sonos.port }); 
					});

					sonos.getGroupMuted(function (err, muted) {
		 				uiPort.postMessage({ type: 'group-mute', state: muted, host: sonos.host, port: sonos.port }); 
					});

					sonos.currentTrack(function (err, track) {
		 				uiPort.postMessage({ type: 'currentTrack', track: track, host: sonos.host, port: sonos.port }); 
					});

					sonos.getCurrentState(function (err, state) {
		 				uiPort.postMessage({ type: 'currentState', state: state, host: sonos.host, port: sonos.port }); 
					});

					sonos.getMusicLibrary('queue', {}, function (err, result) {
		 				uiPort.postMessage({ type: 'queue', result: result, host: sonos.host, port: sonos.port }); 
					});
				}

				if(msg.type === 'queryState') {
					queryState(deviceSearches[msg.host]);						
				}

				if(msg.type === 'browse') {
					deviceSearches[msg.host].getMusicLibrary(msg.searchType, msg.params || {}, function (err, result) {
		 				uiPort.postMessage({ type: 'browse', result: result, host: deviceSearches[msg.host].host, port: deviceSearches[msg.host].port }); 
					});					
				}

				if(msg.type === 'goto') {
					deviceSearches[msg.host].goto(msg.target, function () {
						deviceSearches[msg.host].play(function () {
							queryState(deviceSearches[msg.host]);
						});
					});
				}

				if(msg.type === 'mute') {
					deviceSearches[msg.host].setMuted(true, function () {
						queryState(deviceSearches[msg.host]);
					});
				}

				if(msg.type === 'unmute') {
					deviceSearches[msg.host].setMuted(false, function () {
						queryState(deviceSearches[msg.host]);
					});
				}

				if(msg.type === 'group-mute') {
					deviceSearches[msg.host].setGroupMuted(true, function () {
						queryState(deviceSearches[msg.host]);
					});
				}

				if(msg.type === 'group-unmute') {
					deviceSearches[msg.host].setGroupMuted(false, function () {
						queryState(deviceSearches[msg.host]);
					});
				}

				if(msg.type === 'play') {
					if(!msg.item) {
						deviceSearches[msg.host].play(function () {
							queryState(deviceSearches[msg.host]);
						});
					} else {
						deviceSearches[msg.host].play(msg.item.uri , function () {
							queryState(deviceSearches[msg.host]);
						});
					}
				}

				if(msg.type === 'pause') {
					deviceSearches[msg.host].pause(function () {
						queryState(deviceSearches[msg.host]);
					});
				}

				if(msg.type === 'next') {
					deviceSearches[msg.host].next(function () {
						queryState(deviceSearches[msg.host]);
					});										
				}

				if(msg.type === 'prev') {
					deviceSearches[msg.host].previous(function () {
						queryState(deviceSearches[msg.host]);
					});					
				}

				if(msg.type === 'selectZoneGroup') {
					var sonos;

					msg.ZoneGroup.ZoneGroupMember.forEach(function (m) {
						if(m.$.UUID === msg.ZoneGroup.$.Coordinator) {
							var l = m.$.Location;
							var matches = reg.exec(l);

							sonos = deviceSearches[matches[1]];
						}
					});				


					if(sonos) {

						if(currentSonos) {
							unsubscribeServiceEvents(currentSonos);
						}

						currentSonos = sonos;
		 				uiPort.postMessage({ type: 'coordinator', state: { host: sonos.host, port: sonos.port }, host: sonos.host, port: sonos.port }); 
						
		 				subscribeServiceEvents(sonos);
						queryState(sonos);
					}
				}
			});
		}

		if(search) {
			search.destroy();
		}

		var search = new Search(function (sonos) {

			deviceSearches[sonos.host] = sonos;
			listeners[sonos.host] = new Listener(sonos);

			listeners[sonos.host].listen(function (err) {
				if (err) throw err;

				listeners[sonos.host].onServiceEvent(function(endpoint, sid, data) {

					console.log(endpoint, sid, data);

					if(endpoint === '/ZoneGroupTopology/Event') {
						var state = xml2json(data.ZoneGroupState, {
							explicitArray: true
						});

						if(uiPort) {
			 				uiPort.postMessage({ type: 'topology', state: state }); 
						}					
					}


					if(endpoint === '/MediaRenderer/AVTransport/Event') {
						var lastChange = xml2json(data.LastChange);

						// need to make sense of the info here
						// console.log(lastChange.Event.InstanceID);

						var currentTrackDIDL = xml2json(lastChange.Event.InstanceID.CurrentTrackMetaData.$.val, {
							explicitArray: true						
						});

		 				uiPort.postMessage({ type: 'currentTrack', track: sonos.parseDIDL(currentTrackDIDL), host: sonos.host, port: sonos.port }); 

						// console.log('CurrentTrackMetaData', sonos.parseDIDL(currentTrackDIDL));

						var nextTrackDIDL = xml2json(lastChange.Event.InstanceID['r:NextTrackMetaData'].$.val, {
							explicitArray: true						
						});

						// console.log('NextTrackMetaData', sonos.parseDIDL(lastChange.Event.InstanceID['r:NextTrackMetaData'].$.val));

						// console.log('TransportState', sonos.translateState(lastChange.Event.InstanceID.TransportState.$.val));

		 				uiPort.postMessage({ type: 'currentState', state: sonos.translateState(lastChange.Event.InstanceID.TransportState.$.val), host: sonos.host, port: sonos.port }); 
					}

				});


				if(!currentSonos) {
					currentSonos = sonos;
					subscribeServiceEvents(currentSonos);
				}

			});

		});			
	});



	chrome.app.window.create('window.html', {
		'bounds': {
			'width': 800,
			'height': 600
		}
	});

});