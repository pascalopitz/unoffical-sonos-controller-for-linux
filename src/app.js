import Search from './sonos/Search';
import Listener from './events/listener';

var search;

chrome.app.runtime.onLaunched.addListener(function() {

	var firstSonos;

	if(search) {
		search.destroy();
	}

	search = new Search(function (sonos) {


		sonos.getVolume(function (err, vol) {
			console.log(sonos.host, 'Volume', vol);
		});

		sonos.deviceDescription(function (err, desc) {
			console.log(sonos.host, 'deviceDescription', desc);
		});

		sonos.getZoneInfo(function (err, result) {
			console.log(sonos.host, 'getZoneInfo', result);
		});

		if(!firstSonos) {
			firstSonos = sonos;

			sonos.getMusicLibrary('artists', {}, function (err, result) {
				console.log(sonos.host, 'getMusicLibrary', result);
			});

			var x = new Listener(sonos);
			x.listen(function(err) {
			  if (err) throw err;
			  
			  x.addService('/ZoneGroupTopology/Event', function(error, sid) {
			    if (error) throw err;
			    console.log('Successfully subscribed, with subscription id', sid);
			  });

			  // x.on('serviceEvent', function(endpoint, sid, data) {
			  //   console.log('Received event from', endpoint, '(' + sid + ') with data:', data, '\n\n');
			  // });
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