import _ from 'lodash';
import moment from 'moment';

import requestHelper from 'request';
import xml2json from 'jquery-xml2json';

import SonosService from '../services/SonosService';

const NS = 'http://www.sonos.com/Services/1.1';
const deviceProviderName =  'SonosControllerForChrome';
const RUNTIME_ID = 'pascal-sonos-app';

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


class MusicServiceClient {

	constructor(serviceDefinition) {
		this._serviceDefinition = serviceDefinition;

		this.name = serviceDefinition.Name;
		this.auth = serviceDefinition.Auth;
	}

	_doRequest(uri, action, body, headers) {
		return new Promise((resolve, reject) => {
			requestHelper({
				uri: uri,
				method: 'POST',
				headers: {
					'SOAPAction': '"' + NS + '#' + action + '"',
					'Content-type': 'text/xml; charset=utf8'
				},
				body: withinEnvelope(body, headers)
			}, (err, res, body) => {

				if(err || res.statusCode >= 400) {
					let e = xml2json(stripNamespaces(body));

					if(_.get(e, 'Envelope.Body.Fault.faultstring') === 'TokenRefreshRequired') {
						let refreshDetails = _.get(e, 'Envelope.Body.Fault.detail.refreshAuthTokenResult');
						this.setAuthToken(refreshDetails.authToken);
						return reject(refreshDetails.authToken);
					} else {
						return reject(null);
					}
				}

				resolve(body);
			});

		});
	}

	getTrackURI(trackId, serviceId, sn) {
		let protocol = 'x-sonos-http';
		let suffix = '.mp3';

		if(String(serviceId) === '12') {
			protocol = 'x-spotify';
			suffix = '';

			if (trackId.startsWith('spotify:track:')) {
				return  escape(trackId);
			}

			if (trackId.startsWith('spotify:album:')) {
				return 'x-rincon-cpcontainer:0004206c' + escape(trackId);
			}

			if (trackId.startsWith('spotify:artistTopTracks:')) {
				return 'x-rincon-cpcontainer:000e206c' + escape(trackId);
			}

			if (trackId.startsWith('spotify:user:')) {
				return 'x-rincon-cpcontainer:0006206c' + escape(trackId);
			}

			if (trackId.startsWith('spotify:artistRadio:')) {
				return  escape(trackId);
			}
		}

		return `${protocol}:${escape(trackId)}${suffix}?sid=${serviceId}&sn=${sn}&flags=8224`;
	}

	getServiceString(serviceType, token) {
		return `SA_RINCON${serviceType}_${token}`;
	}

	encodeItemMetadata(uri, item, serviceString) {

		let TYPE_MAPPINGS = {
			track: {
				type: 'object.item.audioItem.musicTrack',
				token: '00032020',
			},
			album: {
				type: 'object.container.album.musicAlbum',
				token: '0004206c',
			},
			trackList: {
				type: 'object.container.playlistContainer',
				token: '000e206c',
			},
			playList: {
				type: 'object.container.playlistContainer',
				token: '0006206c',
			},
			program: {
				type: 'object.item.audioItem.audioBroadcast.#' + item.displayType,
				token: '000c206c',
			},
		};

		let resourceString, id, trackData;
		let servceId = item.serviceClient._serviceDefinition.ServiceIDEncoded;

		if(serviceString) {
			id = TYPE_MAPPINGS[item.itemType].token + escape(item.id);
			resourceString = `<desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">${serviceString}</desc>`
		} else {
			id = '-1';
			let duration = moment.duration(item.trackMetadata.duration || 0);
			resourceString = `<res protocolInfo="${uri.match(/^[\w\-]+:/)[0]}*${item.mimeType}*"
				duration="${_.padLeft(d.hours(), 2, '0')}:${_.padLeft(d.minutes(), 2, '0')}:${_.padLeft(d.seconds(), 2, '0')}">${_.escape(uri)}</res>`;
		}

		if(item.trackMetadata) {
			trackData = `<dc:creator>${_.escape(item.trackMetadata.artist)}</dc:creator>
			<upnp:albumArtURI>${item.trackMetadata.albumArtURI || ''}</upnp:albumArtURI>
			<upnp:album>${_.escape(item.trackMetadata.album || '')}</upnp:album>`
		}

		let didl = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
		xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
		xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/"
		xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
		<item id="${id}" restricted="true">
		${resourceString}
		<dc:title>${_.escape(item.title)}</dc:title>
		<upnp:class>${TYPE_MAPPINGS[item.itemType].type}</upnp:class>
		${trackData || ''}
		</item>
		</DIDL-Lite>`;

		return didl;
	}

	setAuthToken(token) {
		this.authToken = token;
	}

	setKey(key) {
		this.key = key;
	}

	getDeviceLinkCode() {

		let headers = ['<ns:credentials>',
			 '<ns:deviceId>', RUNTIME_ID ,'</ns:deviceId>',
			 '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
		  '</ns:credentials>'].join('');

		let body = ['<ns:getDeviceLinkCode>',
		 '<ns:householdId>', SonosService.householdId, '</ns:householdId>',
	  '</ns:getDeviceLinkCode>'].join('');

		return this._doRequest(this._serviceDefinition.SecureUri, 'getDeviceLinkCode', body, headers)
			.then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getDeviceLinkCodeResponse']['getDeviceLinkCodeResult'];
				return obj;
			});
	}

	getDeviceAuthToken(linkCode) {

		let headers = ['<ns:credentials>',
			 '<ns:deviceId>', RUNTIME_ID ,'</ns:deviceId>',
			 '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
		  '</ns:credentials>'].join('');

		let body = ['<ns:getDeviceAuthToken>',
		 '<ns:householdId>', SonosService.householdId, '</ns:householdId>',
		 '<ns:linkCode>', linkCode, '</ns:linkCode>',
	  '</ns:getDeviceAuthToken>'].join('');

		return this._doRequest(this._serviceDefinition.SecureUri, 'getDeviceAuthToken', body, headers)
			.then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getDeviceAuthTokenResponse']['getDeviceAuthTokenResult'];
				return obj;
			});
	}

	getMetadata(id, index=0, count=200) {

		let headers = ['<ns:credentials>',
			 '<ns:deviceId>', RUNTIME_ID ,'</ns:deviceId>',
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

	  return new Promise((resolve, reject) => {
		this._doRequest(this._serviceDefinition.SecureUri, 'getMetadata', body, headers)
			.then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getMetadataResponse']['getMetadataResult'];
				resolve(obj);
			})
			.catch((authToken) => {
				if(authToken) {
					this.getMetadata(id, index, count).then((obj) => {
						resolve(obj);
					});
				} else {
					reject();
				}
			});
		});
	}

	search(id, term, index=0, count=200) {

		let headers = ['<ns:credentials>',
			 '<ns:deviceId>', RUNTIME_ID ,'</ns:deviceId>',
			 '<ns:deviceProvider>', deviceProviderName, '</ns:deviceProvider>',
			 '<ns:loginToken>',
				'<ns:token>', this.authToken ,'</ns:token>',
				'<ns:key>', this.key ,'</ns:key>',
				'<ns:householdId>', SonosService.householdId, '</ns:householdId>',
		 	'</ns:loginToken>',
		  '</ns:credentials>'].join('');

		let body = ['<ns:search>',
		 '<ns:id>', id, '</ns:id>',
		 '<ns:term>', _.escape(term), '</ns:term>',
		 '<ns:index>', index, '</ns:index>',
		 '<ns:count>', count, '</ns:count>',
	  '</ns:search>'].join('');

	  return new Promise((resolve, reject) => {
		return this._doRequest(this._serviceDefinition.SecureUri, 'search', body, headers)
			.then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['searchResponse']['searchResult'];
				resolve(obj);
			})
			.catch((authToken) => {
				if(authToken) {
					this.search(id, term, index, count).then((obj) => {
						resolve(obj);
					});
				} else {
					reject();
				}
			});
		});
	}

	getMediaURI(id) {

		let headers = ['<ns:credentials>',
			 '<ns:deviceId>', RUNTIME_ID ,'</ns:deviceId>',
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

	  return new Promise((resolve, reject) => {
		return this._doRequest(this._serviceDefinition.SecureUri, 'getMediaURI', body, headers)
			.then((res) => {
				let resp = xml2json(stripNamespaces(res));
				let obj = resp['Envelope']['Body']['getMediaURIResponse']['getMediaURIResult'];
				return resolve(obj);
			})
			.catch((authToken) => {
				if(authToken) {
					this.getMediaURI(id).then((obj) => {
						resolve(obj);
					});
				} else {
					reject();
				}
			});
		});
	}

	getSessionId(username, password) {

	}

}

export default MusicServiceClient;
