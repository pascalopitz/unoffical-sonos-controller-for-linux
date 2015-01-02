import Search from 'sonos/Search';

var search;

chrome.app.runtime.onLaunched.addListener(function() {

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

		sonos.getMusicLibrary('artists', {}, function (err, result) {
			console.log(sonos.host, 'getMusicLibrary', result);
		});

	});

	chrome.app.window.create('window.html', {
    	'bounds': {
    		'width': 800,
    		'height': 600
    	}
	});

});