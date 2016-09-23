import _ from 'lodash';
import os from 'os';
const ifaces = os.networkInterfaces();

let firstInterface;

Object.keys(ifaces).forEach(function (ifname) {
	var alias = 0;

	ifaces[ifname].forEach(function (iface) {
		if (firstInterface || 'IPv4' !== iface.family || iface.internal !== false) {
			return;
		}

		firstInterface = iface;
	});
});

var ip = {
	address: function () {
		return firstInterface.address;
	}
};

export default ip;
