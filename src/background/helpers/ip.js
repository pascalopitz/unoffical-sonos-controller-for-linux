var firstInterface;

chrome.system.network.getNetworkInterfaces(function(interfaces) {
	// TODO: don't just get the first one,
	// but the one that is in the same subnet as the sonos devices
    firstInterface = interfaces[0];
});

var ip = {
	address: function () {
		return firstInterface.address;
	}
};

export default ip;