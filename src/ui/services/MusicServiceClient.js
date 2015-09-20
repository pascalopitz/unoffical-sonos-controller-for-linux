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

function stripNamespaces(xml) {
	return xml.replace(/\<\/\w+:/gi, '</').replace(/\<\w+:/gi, '<');
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

        this.name = serviceDefinition.Name;
        this.auth = serviceDefinition.Auth;
    }

	setAuthToken(token) {
		this.authToken = token;
	}

	setKey(key) {
		this.key = key;
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
                let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getDeviceLinkCodeResponse']['getDeviceLinkCodeResult'];
				return obj;
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
                let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getDeviceAuthTokenResponse']['getDeviceAuthTokenResult'];
				return obj;
			});
    }

	getMetadata(id, index, count) {

        let headers = ['<ns:credentials>',
             '<ns:deviceId>00:00:00:00:00</ns:deviceId>',
             '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
			 '<ns:loginToken>',
            	'<ns:token>', this.authToken ,'</ns:token>',
				'<ns:key>', this.key ,'</ns:key>',
				'<ns:householdId>', SonosService.householdId, '</ns:householdId>',
         	'</ns:loginToken>',
          '</ns:credentials>'].join('');

        let body = ['<ns:getMetadata>',
         '<ns:id>', id, '</ns:id>',
		 '<ns:index>', index, '</ns:index>',
		 '<ns:count>', count, '</ns:count>',
      '</ns:getMetadata>'].join('');

        return _doRequest(this._serviceDefinition.SecureUri, 'getMetadata', body, headers)
            .then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getMetadataResponse']['getMetadataResult'];
				return obj;
			});
    }

	getMediaURI(id) {

        let headers = ['<ns:credentials>',
             '<ns:deviceId>00:00:00:00:00</ns:deviceId>',
             '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
			 '<ns:loginToken>',
            	'<ns:token>', this.authToken ,'</ns:token>',
				'<ns:key>', this.key ,'</ns:key>',
				'<ns:householdId>', SonosService.householdId, '</ns:householdId>',
         	'</ns:loginToken>',
          '</ns:credentials>'].join('');

        let body = ['<ns:getMediaURI>',
         '<ns:id>', id, '</ns:id>',
      '</ns:getMediaURI>'].join('');

        return _doRequest(this._serviceDefinition.SecureUri, 'getMediaURI', body, headers)
            .then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getMediaURIResponse']['getMediaURIResult'];
				return obj;
			});
    }

    getSessionId(username, password) {

    }

}

export default MusicServiceClient;
