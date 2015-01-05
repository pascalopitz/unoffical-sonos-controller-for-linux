import Search from './sonos/Search';
import Listener from './events/listener';

chrome.app.runtime.onLaunched.addListener(function() {

	var firstSonos;
	var uiPort;

	var deviceSearches = {};
	var reg = /^http:\/\/([\d\.]+)/; 

	chrome.runtime.onConnect.addListener(function(port) {
  		console.log('port open', port);

  		if(port.name === 'ui') {
  			uiPort = port;
			port.onMessage.addListener(function(msg) {
				// handle messages
				if(msg.type === 'selectZoneGroup') {
					var l = msg.ZoneGroup.ZoneGroupMember[0].$.Location;
					var matches = reg.exec(l);

					var sonos = deviceSearches[matches[1]];

					if(sonos) {
						sonos.getVolume(function (err, vol) {
			 				uiPort.postMessage({ type: 'volume', state: vol, host: sonos.host }); 
						});

						sonos.currentTrack(function (err, track) {
							console.log('currentTrack', track)
			 				uiPort.postMessage({ type: 'currentTrack', track: track, host: sonos.host }); 
						});

						// sonos.deviceDescription(function (err, desc) {
						// 	console.log(sonos.host, 'deviceDescription', desc);
						// });

						// sonos.getZoneInfo(function (err, result) {
						// 	console.log(sonos.host, 'getZoneInfo', result);
						// });

						// sonos.getMusicLibrary('artists', {}, function (err, result) {
						// 	console.log(sonos.host, 'getMusicLibrary', result);
						// });						
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