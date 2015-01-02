import Search from 'sonos/Search';

chrome.app.runtime.onLaunched.addListener(function() {

	var s = new Search(function (sonos) {

		sonos.getVolume(function (err, vol) {
			console.log(sonos.host, 'Volume', vol);
		});

		sonos.deviceDescription(function (err, desc) {
			console.log(sonos.host, 'deviceDescription', desc);
		});

	});

	chrome.app.window.create('window.html', {
    	'bounds': {
    		'width': 800,
    		'height': 600
    	}
	});

});