import _ from 'lodash';
import moment from 'moment';

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
	return xml.replace(/\<\/[\w\d-]+:/gi, '</').replace(/\<[\w\d-]+:/gi, '<');
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

	getTrackURI(trackId, serviceId, sn) {
		let protocol = 'x-sonos-http';
		let suffix = '.mp3';

		if(String(serviceId) === "12") {
			protocol = 'x-sonos-spotify';
			suffix = '';
		}

		return `${protocol}:${escape(trackId)}${suffix}?sid=${serviceId}&sn=${sn}&flags=8224`;
	}

	getServiceString(serviceType, token) {
		return `SA_RINCON${serviceType}_${token}`;
	}

	encodeItemMetadata(uri, item, serviceString) {

		let resourceString, id;
		let servceId = item.serviceClient._serviceDefinition.ServiceIDEncoded;
		let duration = moment().startOf('day').add(item.trackMetadata.duration, 'seconds').format('HH:mm:ss');

		if(serviceString) {
			id = '00032020' + escape(item.id);
			resourceString = `<desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">${serviceString}</desc>`
		} else {
			id = '-1';
			resourceString = `<res protocolInfo="${uri.match(/^[\w\-]+:/)[0]}*${item.mimeType}*" duration="${duration}">${_.escape(uri)}</res>`;
		}


let didl = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/"
xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
<item id="${id}" parentID="-1" restricted="true">
${resourceString}
<dc:title>${_.escape(item.title)}</dc:title>
<dc:creator>${_.escape(item.trackMetadata.artist)}</dc:creator>
<upnp:class>object.item.audioItem.musicTrack</upnp:class>
<upnp:albumArtURI>${item.trackMetadata.albumArtURI || ''}</upnp:albumArtURI>
<upnp:album>${_.escape(item.trackMetadata.album || '')}</upnp:album>
</item>
</DIDL-Lite>`;

		return didl;
	}

	setAuthToken(token) {
		this.authToken = token; //'2:a7sPc9SYlRkw31FGQm8CLTg9Gmo6GG6MjkXE1XdGmB/JZQsw5swAc+ZHONIBSxAW5MPTk577ncqmlCSBoixGNg==';
	}

	setKey(key) {
		this.key = key;
	}

    getDeviceLinkCode() {

        let headers = ['<ns:credentials>',
             '<ns:deviceId>', chrome.runtime.id ,'</ns:deviceId>',
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
             '<ns:deviceId>', chrome.runtime.id ,'</ns:deviceId>',
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
             '<ns:deviceId>', chrome.runtime.id ,'</ns:deviceId>',
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
             '<ns:deviceId>', chrome.runtime.id ,'</ns:deviceId>',
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
