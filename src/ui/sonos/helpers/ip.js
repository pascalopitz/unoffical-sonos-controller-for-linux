var firstInterface;

chrome.system.network.getNetworkInterfaces(function(interfaces) {
	// TODO: don't just get the first one,
	// but the one that is in the same subnet as the sonos devices
	interfaces.forEach(function (i) {
		// test to exclude ipv6
		if(!firstInterface && i.address.match(/\d+\.\d+\.\d+\.\d+/)) {
			firstInterface = i;
		}
	});
});

var ip = {
	address: function () {
		console.log(firstInterface.address);
		return firstInterface.address;
	}
};

export default ip;