var uiPort = chrome.runtime.connect({name: "ui"});
var handlers = [];

uiPort.onMessage.addListener(function(msg) {
	handlers.forEach(function (f) {
		f(msg);
	});
});

class Port {
	registerCallback (f) {
		handlers.push(f);
	}

	postMessage () {
		uiPort.postMessage.apply(uiPort, arguments);
	}
}

var instance = new Port();

export default function () {
	return instance;
};