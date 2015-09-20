import requestHelper from '../sonos/helpers/request';
import xml2json from 'jquery-xml2json';

import SonosService from '../services/SonosService';

const NS = 'http://www.sonos.com/Services/1.1';
const deviceProviderName =  'SonosControllerForChrome';

function withinEnvelope(body, headers='') {
	return ['<?xml version="1.0" encoding="utf-8"?>',
	'<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="'+NS+'">',
    '<s:Header>' + headers  + '</s:Header>',
	'<s:Body>' + body + '</s:Body>',
	'</s:Envelope>'].join('');
}

function _doRequest(uri, action, body, headers) {
    return new Promise((resolve, reject) => {
        requestHelper({
            uri: uri,
            method: 'POST',
            headers: {
                'SOAPAction': '"' + NS + '#' + action + '"',
                'Content-type': 'text/xml; charset=utf8'
            },
            body: withinEnvelope(body, headers)
        }, function(err, res, body) {

            if(err) {
                return reject(err, res);
            }

            resolve(body);
        });

    });
}


class MusicServiceClient {

    constructor(serviceDefinition) {
        this._serviceDefinition = serviceDefinition;

        this.name = serviceDefinition.name;
        this.auth = serviceDefinition.Auth;
    }

    getDeviceLinkCode() {

        let headers = ['<ns:credentials>',
             '<ns:deviceId>00:00:00:00:00</ns:deviceId>',
             '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
          '</ns:credentials>'].join('');

        let body = ['<ns:getDeviceLinkCode>',
         '<ns:householdId>', SonosService.householdId, '</ns:householdId>',
      '</ns:getDeviceLinkCode>'].join('');

        return _doRequest(this._serviceDefinition.SecureUri, 'getDeviceLinkCode', body, headers)
            .then((res) => {
                let resp = xml2json(res);
				let obj = resp['s:Envelope']['s:Body']['ns:getDeviceLinkCodeResponse']['ns:getDeviceLinkCodeResult'];

				return {
					linkCode: obj['ns:linkCode'],
					regUrl: obj['ns:regUrl'],
					showLinkCode: obj['ns:showLinkCode'],
				};
            });
    }

	getDeviceAuthToken(linkCode) {

        let headers = ['<ns:credentials>',
             '<ns:deviceId>00:00:00:00:00</ns:deviceId>',
             '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
          '</ns:credentials>'].join('');

        let body = ['<ns:getDeviceAuthToken>',
         '<ns:householdId>', SonosService.householdId, '</ns:householdId>',
		 '<ns:linkCode>', linkCode, '</ns:linkCode>',
      '</ns:getDeviceAuthToken>'].join('');

        return _doRequest(this._serviceDefinition.SecureUri, 'getDeviceAuthToken', body, headers)
            .then((res) => {
                let resp = xml2json(res);
				let obj = resp['s:Envelope']['s:Body']['ns:getDeviceAuthTokenResponse']['ns:getDeviceAuthTokenResult'];
				console.log(obj);
            }, (err) => {
				console.log(err);
			});
    }

    getSessionId(username, password) {

    }

}

export default MusicServiceClient;
