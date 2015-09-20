import _ from 'lodash';
import uuid from 'uuid';

import request from '../sonos/helpers/request';

let origin = 'https://docs.google.com/forms/d/1Eu7bJ7xPBG4Yjmd6Q-qFNJcPEkIZtcvLXDU1rIden5c/viewform';
let url = 'https://docs.google.com/forms/d/1Eu7bJ7xPBG4Yjmd6Q-qFNJcPEkIZtcvLXDU1rIden5c/formResponse';

let fields = {
	deviceID: 'entry.1858914406',
	key : 'entry.1074514607',
	value : 'entry.1438148745',
};

let deviceID;

export default {
	init (cb) {
		chrome.storage.local.get(['deviceID'], (vals) => {

			if(vals.deviceID) {
				deviceID = vals.deviceID;
				cb();
				return;
			}

			deviceID = uuid();

			chrome.storage.local.set({
				deviceID: deviceID,
			}, () => {
				cb();
			})
		});
	},

	log (key, value) {
		let msg = [];

		msg.push(fields.deviceID + '=' + JSON.stringify(deviceID, true, 4));
		msg.push(fields.key + '=' + JSON.stringify(key, true, 4));
		msg.push(fields.value + '=' + JSON.stringify(value, true, 4));

		request({
			method: 'POST',
			uri: url,
			body: msg.join('&'),
			headers: {
				//referer: origin,
				'content-type': 'application/x-www-form-urlencoded',
			}
		}, (err, resp, data) => {
			//debugger;
		})
	}
};
