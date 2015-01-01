import Search from 'sonos/Search';

chrome.app.runtime.onLaunched.addListener(function() {

	var s = new Search(function (sonos) {
		console.log(sonos);
	});

	chrome.app.window.create('window.html', {
    	'bounds': {
    		'width': 800,
    		'height': 600
    	}
	});

});