chrome.app.runtime.onLaunched.addListener(function() {

	chrome.app.window.create('window.html', {
		'bounds': {
			'width': 1000,
			'height': 800
		}
	});

});
