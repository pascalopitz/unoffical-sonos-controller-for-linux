import Search from './sonos/Search';
import Listener from './events/listener';

chrome.app.runtime.onLaunched.addListener(function() {

	var firstSonos;
	var uiPort;

	var deviceSearches = {};
	var reg = /^http:\/\/([\d\.]+)/; 

	chrome.runtime.onConnect.addListener(function(port) {
  		console.log('port open', port);

  		var polling;

  		if(port.name === 'ui') {
  			uiPort = port;
			port.onMessage.addListener(function(msg) {
				// handle messages

				function queryState(sonos) {
					sonos.getVolume(function (err, vol) {
		 				uiPort.postMessage({ type: 'volume', state: vol, host: sonos.host, port: sonos.port }); 
					});

					sonos.currentTrack(function (err, track) {
						console.log('currentTrack', track)
		 				uiPort.postMessage({ type: 'currentTrack', track: track, host: sonos.host, port: sonos.port }); 
					});

					sonos.getCurrentState(function (err, state) {
						console.log('currentState', state)
		 				uiPort.postMessage({ type: 'currentState', state: state, host: sonos.host, port: sonos.port }); 
					});

					sonos.getMusicLibrary('queue', {}, function (err, result) {
		 				uiPort.postMessage({ type: 'queue', result: result, host: sonos.host, port: sonos.port }); 
					});

					if(polling) {
						window.clearTimeout(polling);
					}

					polling = window.setTimeout(function () {
						queryState(sonos);						
					}, 500)
				}

				if(msg.type === 'browse') {
					deviceSearches[msg.host].getMusicLibrary(msg.searchMode, msg.params || {}, function (err, result) {
		 				uiPort.postMessage({ type: 'browse', result: result, host: deviceSearches[msg.host].host, port: deviceSearches[msg.host].port }); 
					});					
				}

				if(msg.type === 'goto') {
					deviceSearches[msg.host].goto(msg.target, function () {
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
		 				uiPort.postMessage({ type: 'coordinator', state: { host: sonos.host, port: sonos.port }, host: sonos.host, port: sonos.port }); 
						queryState(sonos);
					}
				}
			});
  		}
	});

	if(search) {
		search.destroy();
	}

	var search = new Search(function (sonos) {

		deviceSearches[sonos.host] = sonos;

		if(!firstSonos) {
			firstSonos = sonos;


			var x = new Listener(sonos);
			x.listen(function(err) {
			  if (err) throw err;
			  
			  x.addService('/ZoneGroupTopology/Event', function(error, sid) {
			    if (error) throw err;
			    console.log('Successfully subscribed, with subscription id', sid);
			  });

			  x.onServiceEvent(function(endpoint, sid, data) {

				var state = xml2json(data.ZoneGroupState, {
					explicitArray: true
				});

				if(uiPort) {
	 				uiPort.postMessage({ type: 'topology', state: state }); 
				}
			  });
			});
		}


	});

	chrome.app.window.create('window.html', {
		'bounds': {
			'width': 800,
			'height': 600
		}
	});

});