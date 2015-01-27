var uiPort = chrome.runtime.connect({name: "ui"});
var handlers = [];

uiPort.onMessage.addListener(function(msg) {
	handlers.forEach(function (handler) {
		if(handler.type === msg.type) {
			handler.callback(msg);
		}
	});
});

class Port {
	registerCallback (type, f) {
		handlers.push({
			type: type,
			callback: f,
		});
	}

	postMessage () {
		uiPort.postMessage.apply(uiPort, arguments);
	}
}

var instance = new Port();
export default instance;
