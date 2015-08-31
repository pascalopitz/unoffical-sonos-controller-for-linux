import withinEnvelope from './helpers/withinEnvelope';
import htmlEntities from './helpers/htmlEntities';
import xml2js from './helpers/xml2js';
import xml2json from 'jquery-xml2json';
import requestHelper from './helpers/request';

import Services from './helpers/Services';

window.Services = Services;

import _ from 'lodash';

/**
 * Constants
 */

var TRANSPORT_ENDPOINT = '/MediaRenderer/AVTransport/Control',
		RENDERING_ENDPOINT = '/MediaRenderer/RenderingControl/Control',
		GROUP_RENDERING_ENDPOINT = '/MediaRenderer/GroupRenderingControl/Control',
		DEVICE_ENDPOINT = '/DeviceProperties/Control';


var debug = function() {
	//console.log.apply(null, arguments);
}


class Sonos {

	/**
	 * @param {String} host IP/DNS
	 * @param {Number} port
	 */
	constructor (host, port) {
		this.host = host;
		this.port = port || 1400;
	}

	/**
	 * UPnP HTTP Request
	 * @param	{String}	 endpoint		HTTP Path
	 * @param	{String}	 action			UPnP Call/Function/Action
	 * @param	{String}	 body
	 * @param	{String}	 responseTag Expected Response Container XML Tag
	 * @param	{Function} callback		(err, data)
	 */
	request (endpoint, action, body, responseTag, callback) {
		debug('Sonos.request(%j, %j, %j, %j, %j)', endpoint, action, body, responseTag, callback);
		requestHelper({
			uri: 'http://' + this.host + ':' + this.port + endpoint,
			method: 'POST',
			headers: {
				'SOAPAction': action,
				'Content-type': 'text/xml; charset=utf8'
			},
			body: withinEnvelope(body)
		}, function(err, res, body) {
			if (err) return callback(err);
			if (res.statusCode !== 200) return callback (new Error('HTTP response code ' + res.statusCode + ' for ' + action));

			(new xml2js.Parser()).parseString(body, function(err, json) {
				if (err) return callback(err);

				if(typeof json['s:Envelope']['s:Body'][0]['s:Fault'] !== 'undefined')
					return callback(json['s:Envelope']['s:Body'][0]['s:Fault']);

				return callback(null, json['s:Envelope']['s:Body'][0][responseTag]);
			});
		});
	}

	/**
	 * Get Music Library Information
	 * @param	{String}	 searchType	Choice - artists, albumArtists, albums, genres, composers, tracks, playlists, share, or objectId
	 * @param	{Object}	 options		 Opitional - default {start: 0, total: 100}
	 * @param	{Function} callback (err, result) result - {returned: {String}, total: {String}, items:[{title:{String}, uri: {String}}]}
	 */
	getMusicLibrary (searchType, options, callback){
		var self = this;
		var searches = {
			'artists': 'A:ARTIST',
			'albumArtists': 'A:ALBUMARTIST',
			'albums': 'A:ALBUM',
			'genres': 'A:GENRE',
			'composers': 'A:COMPOSER',
			'tracks': 'A:TRACKS',
			'playlists': 'A:PLAYLISTS',
			'queue': 'Q:0',
			'share': 'S:'
		};

		var defaultOptions = {
			BrowseFlag: 'BrowseDirectChildren',
			Filter: '*',
			StartingIndex: '0',
			RequestedCount: '100',
			SortCriteria: ''
		};

		var opts = {
			ObjectID: [searches[searchType] || searchType]
		};

		if(options.start !== undefined) opts.StartingIndex = options.start;
		if(options.total !== undefined) opts.RequestedCount = options.total;

		opts = _.extend(defaultOptions, opts);

		var contentDirectory = new Services.ContentDirectory(this.host, this.port);
		return contentDirectory.Browse(opts, function(err, data){
			if (err) return callback(err);
			return (new xml2js.Parser()).parseString(data.Result, function(err, didl) {
				if (err) return callback(err, data);

				var items = [];

				if ((!didl) || (!didl['DIDL-Lite']) || ((!Array.isArray(didl['DIDL-Lite'].container)) && (!Array.isArray(didl['DIDL-Lite'].item)))) {
					callback(new Error('Cannot parse DIDTL result'), data);
				}

				_.each(didl['DIDL-Lite'].container || didl['DIDL-Lite'].item, function(item){
					items.push(
						{
							'id': item.$.id,
							'parentID': item.$.parentID,
							'title': Array.isArray(item['dc:title']) ? item['dc:title'][0]: null,
							'creator': Array.isArray(item['dc:creator']) ? item['dc:creator'][0]: null,
							'metadata': Array.isArray(item['r:resMD']) ? self.parseDIDL(xml2json(item['r:resMD'][0], {
								explicitArray: true
							})): null,
							'metadataRaw': Array.isArray(item['r:resMD']) ? item['r:resMD'][0]: null,
							'album': Array.isArray(item['upnp:album']) ? item['upnp:album'][0]: null,
							'albumArtURI': Array.isArray(item['upnp:albumArtURI']) ? item['upnp:albumArtURI'][0]: null,
							'class': Array.isArray(item['upnp:class']) ? item['upnp:class'][0]: null,
							'originalTrackNumber': Array.isArray(item['upnp:originalTrackNumber']) ? item['upnp:originalTrackNumber'][0]: null,
							'uri': Array.isArray(item.res) ? htmlEntities(item.res[0]._): null
						}
					);
				});

				var result = {
					updateID: data.UpdateID,
					returned: data.NumberReturned,
					total: data.TotalMatches,
					items: items
				};

				return callback(null, result);
			});
		});
	}

	/**
	 * Get Music Library Information
	 * @param	{String}	searchType	Choice - artists, albumArtists, albums, genres, composers, tracks, playlists, share
	 * @param	{String}	searchTerm	search term to search for
	 * @param	{Object}	options	 Opitional - default {start: 0, total: 100}
	 * @param	{Function}	callback (err, result) result - {returned: {String}, total: {String}, items:[{title:{String}, uri: {String}}]}
	 */
	searchMusicLibrary (searchType, searchTerm, options, callback) {
		var self = this;
		var searches = {
			'artists': 'A:ARTIST',
			'albumArtists': 'A:ALBUMARTIST',
			'albums': 'A:ALBUM',
			'genres': 'A:GENRE',
			'composers': 'A:COMPOSER',
			'tracks': 'A:TRACKS',
			'playlists': 'A:PLAYLISTS',
			'share': 'S:'
		}
		var defaultOptions = {
			BrowseFlag: 'BrowseDirectChildren',
			Filter: '*',
			StartingIndex: '0',
			RequestedCount: '100',
			SortCriteria: ''
		}
		var searches = searches[searchType] + ':' + searchTerm
		var opts = {
			ObjectID: searches
		}

		opts = _.extend(defaultOptions, opts)
		var contentDirectory = new Services.ContentDirectory(this.host, this.port)
		return contentDirectory.Browse(opts, function (err, data) {
			if (err) return callback(err)
			return (new xml2js.Parser()).parseString(data.Result, function (err, didl) {
				if (err) return callback(err, data)
				var items = []
				if ((!didl) || (!didl['DIDL-Lite']) || (!Array.isArray(didl['DIDL-Lite'].item || didl['DIDL-Lite'].container))) {
					callback(new Error('Cannot parse DIDTL result'), data)
				}
				_.each(didl['DIDL-Lite'].item || didl['DIDL-Lite'].container, function (item) {
					items.push(
						{
							'title': Array.isArray(item['dc:title']) ? item['dc:title'][0]: null,
							'creator': Array.isArray(item['dc:creator']) ? item['dc:creator'][0]: null,
							'metadata': Array.isArray(item['r:resMD']) ? self.parseDIDL(xml2json(item['r:resMD'][0], {
								explicitArray: true
							})): null,
							'metadataRaw': Array.isArray(item['r:resMD']) ? item['r:resMD'][0]: null,
							'album': Array.isArray(item['upnp:album']) ? item['upnp:album'][0]: null,
							'albumArtURI': Array.isArray(item['upnp:albumArtURI']) ? item['upnp:albumArtURI'][0]: null,
							'class': Array.isArray(item['upnp:class']) ? item['upnp:class'][0]: null,
							'originalTrackNumber': Array.isArray(item['upnp:originalTrackNumber']) ? item['upnp:originalTrackNumber'][0]: null,
							'uri': Array.isArray(item.res) ? htmlEntities(item.res[0]._): null
						}
					)
				})
				var result = {
					returned: data.NumberReturned,
					total: data.TotalMatches,
					items: items
				}
				return callback(null, result)
			})
		})
	}

	/**
	 * Get Current Track
	 * @param	{Function} callback (err, track)
	 */
	currentTrack (callback) {
		debug('Sonos.currentTrack(' + ((callback) ? 'callback' : '') + ')');

		var _this = this;

		var action = '"urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo"';
		var body = '<u:GetPositionInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Channel>Master</Channel></u:GetPositionInfo>';
		var responseTag = 'u:GetPositionInfoResponse';

		return this.request(TRANSPORT_ENDPOINT, action, body, responseTag, function(err, data) {
			if (err) return callback(err);

			if ((!Array.isArray(data)) || (data.length < 1)) return {};

			var metadata = data[0].TrackMetaData[0];
			var position = (parseInt(data[0].RelTime[0].split(':')[0], 10) * 60 * 60) +
										 (parseInt(data[0].RelTime[0].split(':')[1], 10) * 60) +
										 parseInt(data[0].RelTime[0].split(':')[2], 10);

			var duration = (parseInt(data[0].TrackDuration[0].split(':')[0], 10) * 60 * 60) +
										 (parseInt(data[0].TrackDuration[0].split(':')[1], 10) * 60) +
										 parseInt(data[0].TrackDuration[0].split(':')[2], 10);

			if (metadata && metadata !== 'NOT_IMPLEMENTED') {
				return (new xml2js.Parser()).parseString(metadata, function(err, data) {
					var track;

					if (err) return callback(err, data);

					track = _this.parseDIDL(data);
					track.position = position;
					track.duration = duration;
					track.albumArtURL = !track.albumArtURI ? null
															: (track.albumArtURI.indexOf('http') !== -1) ? track.albumArtURI
															: 'http://' + _this.host + ':' + _this.port + track.albumArtURI;

					return callback(null, track);
				});
			} else {
				return callback(null, { position: position || 0, duration: duration || 0});
			}
		});
	}

	/**
	 * Parse DIDL into track structure
	 * @param	{String} didl
	 * @return	{object}
	 */
	parseDIDL (didl) {
		var item;

		if ((!didl) || (!didl['DIDL-Lite']) || (!Array.isArray(didl['DIDL-Lite'].item)) || (!didl['DIDL-Lite'].item[0])) return {};
		item = didl['DIDL-Lite'].item[0];
		return {
			title: Array.isArray(item['dc:title']) ? item['dc:title'][0]: null,
			artist: Array.isArray(item['dc:creator']) ? item['dc:creator'][0]: null,
			album: Array.isArray(item['upnp:album']) ? item['upnp:album'][0]: null,
			'class': Array.isArray(item['upnp:class']) ? item['upnp:class'][0]: null,
			albumArtURI : Array.isArray(item['upnp:albumArtURI']) ? item['upnp:albumArtURI'][0] : null,
			originalTrackNumber : Array.isArray(item['upnp:originalTrackNumber']) ? item['upnp:originalTrackNumber'][0] : null
		};
	}

	/**
	 * Get Current Volume
	 * @param	{Function} callback (err, volume)
	 */
	getVolume (callback) {
		debug('Sonos.getVolume(' + ((callback) ? 'callback' : '') + ')');

		var action = '"urn:schemas-upnp-org:service:RenderingControl:1#GetVolume"';
		var body = '<u:GetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel></u:GetVolume>';
		var responseTag = 'u:GetVolumeResponse';

		return this.request(RENDERING_ENDPOINT, action, body, responseTag, function(err, data) {
			if (err) return callback(err);

			callback(null, parseInt(data[0].CurrentVolume[0], 10));
		});
	}

	/**
	 * Get Current Muted
	 * @param	{Function} callback (err, muted)
	 */
	getMuted (callback) {
		debug('Sonos.getMuted(' + ((callback) ? 'callback' : '') + ')');

		var action = '"urn:schemas-upnp-org:service:RenderingControl:1#GetMute"';
		var body = '<u:GetMute xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel></u:GetMute>';
		var responseTag = 'u:GetMuteResponse';

		return this.request(RENDERING_ENDPOINT, action, body, responseTag, function(err, data) {
			if (err) return callback(err);

			callback(null, parseInt(data[0].CurrentMute[0], 10) ? true : false);
		});
	}

	/**
	 * Get Current Muted
	 * @param	{Function} callback (err, muted)
	 */
	getGroupMuted (callback) {
		debug('Sonos.getMuted(' + ((callback) ? 'callback' : '') + ')');

		var action = '"urn:schemas-upnp-org:service:GroupRenderingControl:1#GetGroupMute"';
		var body = '<u:GetGroupMute xmlns:u="urn:schemas-upnp-org:service:GroupRenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel></u:GetGroupMute>';
		var responseTag = 'u:GetGroupMuteResponse';

		return this.request(GROUP_RENDERING_ENDPOINT, action, body, responseTag, function(err, data) {
			if (err) return callback(err);

			callback(null, parseInt(data[0].CurrentMute[0], 10) ? true : false);
		});
	}

	/**
	 * Resumes Queue or Plays Provided URI
	 * @param	{String|Object}	 uri			Optional - URI to a Audio Stream or Object with play options
	 * @param	{Function} callback (err, playing)
	 */
	play (uri, callback) {
		debug('Sonos.play(%j, %j)', uri, callback);
		var action, body, self = this;

		var cb = (typeof uri === 'function' ? uri : callback) || function() {};
		var options = (typeof uri === 'object' ? uri : {});
		if (typeof uri === 'object') {
			options.uri = uri.uri;
			options.metadata = uri.metadata;
		} else {
			options.uri = (typeof uri === 'string' ? uri : undefined);
		}

		if (options.uri) {

			return this.queueNext({
				uri: options.uri,
				metadata: options.metadata
			}, function(err) {
				if (err) {
					return cb(err);
				}
				return self.play(cb);
			});
		} else {

			action = '"urn:schemas-upnp-org:service:AVTransport:1#Play"';
			body = '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>';
			return this.request(TRANSPORT_ENDPOINT, action, body, 'u:PlayResponse', function(err, data) {
				if (err) return cb(err);

				if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
					return cb(null, true);
				} else {
					return cb(new Error({
						err: err,
						data: data
					}), false);
				}
			});
		}
	}

	/**
	 * Stop What's Playing
	 * @param	{Function} callback (err, stopped)
	 */
	stop (callback) {
		debug('Sonos.stop(%j)', callback);
		var action, body;
		action = '"urn:schemas-upnp-org:service:AVTransport:1#Stop"';
		body = '<u:Stop xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Stop>';
		return this.request(TRANSPORT_ENDPOINT, action, body, 'u:StopResponse', function(err, data) {
			if (err) return callback(err);

			if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
				return callback(null, true);
			} else {
				return callback(new Error({
					err: err,
					data: data
				}), false);
			}
		});
	}

	/**
	 * Pause Current Queue
	 * @param	{Function} callback (err, paused)
	 */
	pause (callback) {
		debug('Sonos.pause(%j)', callback);
		var action, body;
		action = '"urn:schemas-upnp-org:service:AVTransport:1#Pause"';
		body = '<u:Pause xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Pause>';
		return this.request(TRANSPORT_ENDPOINT, action, body, 'u:PauseResponse', function(err, data) {
			if (err) return callback(err);

			if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
				return callback(null, true);
			} else {
				return callback(new Error({
					err: err,
					data: data
				}), false);
			}
		});
	}

	/**
	 * Goto track no
	 * @param	{Function} callback (err, seeked)
	 */
	goto (trackNumber, callback) {
		this.selectTrack.call(this, trackNumber, callback);
	}

	/**
	 * Seek the current track
	 * @param	{Function} callback (err, seeked)
	 */
	seek (seconds, callback) {
		debug('Sonos.seek(%j)', callback);
		var action, body, hh, mm, ss;

		hh = Math.floor(seconds / 3600);
		mm = Math.floor((seconds - (hh * 3600)) / 60);
		ss = seconds - ((hh * 3600) + (mm * 60));
		if (hh < 10) hh = '0' + hh;
		if (mm < 10) mm = '0' + mm;
		if (ss < 10) ss = '0' + ss;


		action = '"urn:schemas-upnp-org:service:AVTransport:1#Seek"';
		body = '<u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Unit>REL_TIME</Unit><Target>' + hh + ':' + mm + ':' + ss + '</Target></u:Seek>';
		return this.request(TRANSPORT_ENDPOINT, action, body, 'u:SeekResponse', function(err, data) {
			if (err) return callback(err);

			if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
				return callback(null, true);
			} else {
				return callback(new Error({
					err: err,
					data: data
				}), false);
			}
		});
	}

	/**
	 * Select specific track in queue
	 * @param	{Number}	 trackNr		Number of track in queue (optional, indexed from 1)
	 * @param	{Function} callback (err, data)
	 */
	selectTrack (trackNr, callback) {
		if (typeof trackNr === 'function') {
			callback = trackNr;
			trackNr = 1;
		}
		var action = '"urn:schemas-upnp-org:service:AVTransport:1#Seek"';
		var body = '<u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Unit>TRACK_NR</Unit><Target>' + trackNr + '</Target></u:Seek>';

		return this.request(TRANSPORT_ENDPOINT, action, body, 'u:SeekResponse', function(err, data) {
			if (err) return callback(err);

			if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
				return callback(null, true);
			} else {
				return callback(new Error({
					err: err,
					data: data
				}), false);
			}
		});
	}

	/**
	 * Play next in queue
	 * @param	{Function} callback (err, movedToNext)
	 */
	next (callback) {
		debug('Sonos.next(%j)', callback);
		var action, body;
		action = '"urn:schemas-upnp-org:service:AVTransport:1#Next"';
		body = '<u:Next xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Next>';
		this.request(TRANSPORT_ENDPOINT, action, body, 'u:NextResponse', function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
				return callback(null, true);
			} else {
				return callback(new Error({
					err: err,
					data: data
				}), false);
			}
		});
	}

	/**
	 * Play previous in queue
	 * @param	{Function} callback (err, movedToPrevious)
	 */
	previous (callback) {
		debug('Sonos.previous(%j)', callback);
		var action, body;
		action = '"urn:schemas-upnp-org:service:AVTransport:1#Previous"';
		body = '<u:Previous xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Previous>';
		this.request(TRANSPORT_ENDPOINT, action, body, 'u:PreviousResponse', function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
				return callback(null, true);
			} else {
				return callback(new Error({
					err: err,
					data: data
				}), false);
			}
		});
	}

	/**
	 * Select Queue. Mostly required after turning on the speakers otherwise play, setPlaymode and other commands will fail.
	 * @param	{Function}	callback (err, data)	Optional
	 */
	selectQueue (callback) {
		debug('Sonos.selectQueue(%j)', callback);
		var cb = callback || function() {};
		var self = this;
		self.getZoneInfo(function(err, data){
			if(!err) {
				var action = '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"';
				var body = '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>' + 'x-rincon-queue:RINCON_' + data.MACAddress.replace(/:/g, '') + '0' + self.port + '#0</CurrentURI><CurrentURIMetaData></CurrentURIMetaData></u:SetAVTransportURI>';
				self.request(TRANSPORT_ENDPOINT, action, body, 'u:SetAVTransportURIResponse', function(err, data) {
					if (err) return cb(err);
					if (data[0].$['xmlns:u'] === 'urn:schemas-upnp-org:service:AVTransport:1') {
						return cb(null, true);
					} else {
						return cb(new Error({
							err: err,
							data: data
						}), false);
					}
				});
			} else {
				return cb(err);
			}
		});
	}

	/**
	 * Queue a Song Next
	 * @param	{String|Object}	 uri			URI to Audio Stream or Object containing options (uri, metadata)
	 * @param	{Function} callback (err, queued)
	 */
	queueNext (uri, callback) {
		debug('Sonos.queueNext(%j, %j)', uri, callback);

		var options = (typeof uri === 'object' ? uri : { metadata: '' });
		if (typeof uri === 'object') {
			options.metadata = uri.metadata || '';
			options.metadata = htmlEntities(options.metadata);
			options.uri = uri.uri;
		} else {
			options.uri = uri;
		}

		var action = '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"';
		var body = '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>' + options.uri + '</CurrentURI><CurrentURIMetaData>' + options.metadata + '</CurrentURIMetaData></u:SetAVTransportURI>';
		this.request(TRANSPORT_ENDPOINT, action, body, 'u:SetAVTransportURIResponse', function(err, data) {
			if (callback) {
				return callback(err, data);
			} else {
				return null;
			}
		});
	}

	/**
	 * Add a song to the queue.
	 * @param	{String}	 uri			 URI to Audio Stream
	 * @param	{Number}	 positionInQueue Position in queue at which to add song (optional, indexed from 1,
	 *									defaults to end of queue, 0 to explicitly set end of queue)
	 * @param	{Function} callback (err, queued)
	 */
	queue (uri, positionInQueue, callback) {
		debug('Sonos.queue(%j, %j, %j)', uri, positionInQueue, callback)
		if (typeof positionInQueue === 'function') {
			callback = positionInQueue
			positionInQueue = 0
		}
		var options = (typeof uri === 'object' ? uri : { metadata: '' })
		if (typeof uri === 'object') {
			options.metadata = uri.metadata || ''
			options.metadata = htmlEntities(options.metadata)
			options.uri = uri.uri
		} else {
			options.uri = uri
		}
		var action = '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"'
		var body = '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>' + options.uri + '</EnqueuedURI><EnqueuedURIMetaData>' + options.metadata + '</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>' + positionInQueue + '</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>'
		this.request(TRANSPORT_ENDPOINT, action, body, 'u:AddURIToQueueResponse', function (err, data) {
			return callback(err, data)
		})
	}

	/**
	 * Flush queue
	 * @param	{Function} callback (err, flushed)
	 */
	flush (callback) {
		debug('Sonos.flush(%j)', callback);
		var action, body;
		action = '"urn:schemas-upnp-org:service:AVTransport:1#RemoveAllTracksFromQueue"';
		body = '<u:RemoveAllTracksFromQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID></u:RemoveAllTracksFromQueue>';
		this.request(TRANSPORT_ENDPOINT, action, body, 'u:RemoveAllTracksFromQueueResponse', function(err, data) {
			return callback(err, data);
		});
	}

	/**
	 * Get the LED State
	 * @param	{Function} callback (err, state) state is a string, "On" or "Off"
	 */
	getLEDState (callback) {
		debug('Sonos.getLEDState(%j)', callback);
		var action = '"urn:schemas-upnp-org:service:DeviceProperties:1#GetLEDState"';
		var body = '<u:GetLEDState xmlns:u="urn:schemas-upnp-org:service:DeviceProperties:1"></u:GetLEDState>';
		this.request(DEVICE_ENDPOINT, action, body, 'u:GetLEDStateResponse', function(err, data) {
			if (err) return callback(err, data);
			if(data[0] && data[0].CurrentLEDState && data[0].CurrentLEDState[0])
				return callback(null, data[0].CurrentLEDState[0]);
			callback(new Error('unknown response'));
		});
	}

	/**
	 * Set the LED State
	 * @param	{String}	 desiredState					 "On"/"Off"
	 * @param	{Function} callback (err)
	 */
	setLEDState (desiredState, callback) {
		debug('Sonos.setLEDState(%j, %j)', desiredState, callback);
		var action = '"urn:schemas-upnp-org:service:DeviceProperties:1#SetLEDState"';
		var body = '<u:SetLEDState xmlns:u="urn:schemas-upnp-org:service:DeviceProperties:1"><DesiredLEDState>' + desiredState + '</DesiredLEDState></u:SetLEDState>';
		this.request(DEVICE_ENDPOINT, action, body, 'u:SetLEDStateResponse', function(err) {
			return callback(err);
		});
	}

	/**
	 * Get Zone Info
	 * @param	{Function} callback (err, info)
	 */
	getZoneInfo (callback) {
		debug('Sonos.getZoneInfo(%j)', callback);
		var action = '"urn:schemas-upnp-org:service:DeviceProperties:1#GetZoneInfo"';
		var body = '<u:GetZoneInfo xmlns:u="urn:schemas-upnp-org:service:DeviceProperties:1"></u:GetZoneInfo>';
		this.request(DEVICE_ENDPOINT, action, body, 'u:GetZoneInfoResponse', function(err, data) {
			if (err) return callback(err, data);

			var output = {};
			for (var d in data[0]) if (data[0].hasOwnProperty(d) && d !== '$') output[d] = data[0][d][0];
			callback(null, output);
		});
	}

	/**
	 * Get Zone Attributes
	 * @param	{Function} callback (err, data)
	 */
	getZoneAttrs (callback) {
		debug('Sonos.getZoneAttrs(%j, %j)', callback);

		var action = '"urn:schemas-upnp-org:service:DeviceProperties:1#GetZoneAttributes"';
		var body = '"<u:GetZoneAttributes xmlns:u="urn:schemas-upnp-org:service:DeviceProperties:1"></u:SetZoneAttributes>"';
		this.request(DEVICE_ENDPOINT, action, body, 'u:GetZoneAttributesResponse', function(err, data) {
			if (err) return callback(err, data);

			var output = {};
			for (var d in data[0]) if (data[0].hasOwnProperty(d) && d !== '$') output[d] = data[0][d][0];
			callback(null, output);
		});
	}

	/**
	 * Get Information provided by /xml/device_description.xml
	 * @param	{Function} callback (err, info)
	 */
	deviceDescription (callback) {
		requestHelper({
			uri: 'http://' + this.host + ':' + this.port + '/xml/device_description.xml'
		}, function(err, res, body) {
			if (err) return callback(err);
			if (res.statusCode !== 200) return callback(new Error('non 200 errorCode'));
			(new xml2js.Parser()).parseString(body, function(err, json) {
				if (err) return callback(err);
				var output = {};
				for (var d in json.root.device[0]) if (json.root.device[0].hasOwnProperty(d)) output[d] = json.root.device[0][d][0];
				callback(null, output);
			});
		});
	}

	/**
	 * Set Name
	 * @param	{String}	 name
	 * @param	{Function} callback (err, data)
	 */
	setName (name, callback) {
		debug('Sonos.setName(%j, %j)', name, callback);
		name = name.replace(/[<&]/g, function(str) { return (str === '&') ? '&amp;' : '&lt;';});
		var action = '"urn:schemas-upnp-org:service:DeviceProperties:1#SetZoneAttributes"';
		var body = '"<u:SetZoneAttributes xmlns:u="urn:schemas-upnp-org:service:DeviceProperties:1"><DesiredZoneName>' + name + '</DesiredZoneName><DesiredIcon /><DesiredConfiguration /></u:SetZoneAttributes>"';
		this.request(DEVICE_ENDPOINT, action, body, 'u:SetZoneAttributesResponse', function(err, data) {
			return callback(err, data);
		});
	}

	/**
	 * Set Play Mode
	 * @param	{String}
	 * @param	{Function} callback (err, data)
	 * @return {[type]}
	 */
	setPlayMode (playmode, callback) {
		debug('Sonos.setPlayMode(%j, %j)', playmode, callback);
		var mode = { NORMAL: true, REPEAT_ALL: true, SHUFFLE: true, SHUFFLE_NOREPEAT: true }[playmode.toUpperCase()];
		if (!mode) return callback (new Error('invalid play mode ' + playmode));
		var action = '"urn:schemas-upnp-org:service:AVTransport:1#SetPlayMode"';
		var body = '<u:SetPlayMode xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><NewPlayMode>' + playmode.toUpperCase() + '</NewPlayMode></u:SetPlayMode>';
		this.request(TRANSPORT_ENDPOINT, action, body, 'u:SetPlayModeResponse', function(err, data) {
			return callback(err, data);
		});
	}

	/**
	 * Set Volume
	 * @param	{String}	 volume 0..100
	 * @param	{Function} callback (err, data)
	 * @return {[type]}
	 */
	setVolume (volume, callback) {
		debug('Sonos.setVolume(%j, %j)', volume, callback);
		var action = '"urn:schemas-upnp-org:service:RenderingControl:1#SetVolume"';
		var body = '<u:SetVolume xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>' + volume + '</DesiredVolume></u:SetVolume>';
		this.request(RENDERING_ENDPOINT, action, body, 'u:SetVolumeResponse', function(err, data) {
			return callback(err, data);
		});
	}

	/**
	 * Set Muted
	 * @param	{Boolean}	muted
	 * @param	{Function} callback (err, data)
	 * @return {[type]}
	 */
	setMuted (muted, callback) {
		debug('Sonos.setMuted(%j, %j)', muted, callback);
		if (typeof muted === 'string') muted = parseInt(muted, 10) ? true : false;
		var action = '"urn:schemas-upnp-org:service:RenderingControl:1#SetMute"';
		var body = '<u:SetMute xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel><DesiredMute>' + (muted ? '1' : '0') + '</DesiredMute></u:SetMute>';
		this.request(RENDERING_ENDPOINT, action, body, 'u:SetMuteResponse', function(err, data) {
			return callback(err, data);
		});
	}

	/**
	 * Set GroupMuted
	 * @param	{Boolean}	muted
	 * @param	{Function} callback (err, data)
	 * @return {[type]}
	 */
	setGroupMuted (muted, callback) {
		debug('Sonos.setGroupMuted(%j, %j)', muted, callback);
		if (typeof muted === 'string') muted = parseInt(muted, 10) ? true : false;

		var action = '"urn:schemas-upnp-org:service:GroupRenderingControl:1#SetGroupMute"';
		var body = '<u:SetGroupMute xmlns:u="urn:schemas-upnp-org:service:GroupRenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel><DesiredMute>' + (muted ? '1' : '0') + '</DesiredMute></u:SetMute>';
		this.request(GROUP_RENDERING_ENDPOINT, action, body, 'u:SetGroupMuteResponse', function(err, data) {
			return callback(err, data);
		});
	}

	/**
	 * Get Zones in contact with current Zone with Group Data
	 * @param	{Function} callback (err, topology)
	 */
	getTopology (callback) {
		debug('Sonos.getTopology(%j)', callback);
		requestHelper('http://' + this.host + ':' + this.port + '/status/topology', function(err, res, body) {
			if(err) return callback(err);
			debug(body);
			(new xml2js.Parser()).parseString(body, function(err, topology) {
				if(err) return callback(err);
				var info = topology.ZPSupportInfo;
				var zones = null, mediaServers = null;

				if (info.ZonePlayers && info.ZonePlayers.length > 0) {
					zones = _.map(info.ZonePlayers[0].ZonePlayer, function(zone) {
						return _.extend(zone.$, {name: zone._});
					});
				}

				if (info.MediaServers && info.MediaServers.length > 0) {
					mediaServers = _.map(info.MediaServers[0].MediaServer, function(zone) {
						return _.extend(zone.$, {name: zone._});
					});
				}

				callback(null, {
					zones: zones,
					mediaServers: mediaServers
				});
			});
		});
	}

	/**
	 * Gets accountd data for Player
	 * @param	{Function} callback (err, data)
	 */
	getAccountStatus (callback) {
		debug('Sonos.getAccountStatus(%j)', callback);
		requestHelper('http://' + this.host + ':' + this.port + '/status/accounts', function(err, res, body) {
			if(err) return callback(err);
			debug(body);
			(new xml2js.Parser()).parseString(body, function(err, data) {
				if(err) return callback(err);

				let accounts = [];

				if(data.ZPSupportInfo && data.ZPSupportInfo.Accounts && data.ZPSupportInfo.Accounts[0].Account) {
					accounts = data.ZPSupportInfo.Accounts[0].Account.map((a) => {
						return _.extend(a.$, {
							Username: a.UN[0]
						}, {
							Key: a.Key[0]
						});
					})
				}
				callback(null, accounts);
			});
		});
	}

	/**
	 * Get Current Playback State
	 * @param	{Function} callback (err, state)
	 */
	getCurrentState (callback) {
		debug('Sonos.currentState(%j)', callback);
		var _this = this;
		var action = '"urn:schemas-upnp-org:service:AVTransport:1#GetTransportInfo"';
		var body = '<u:GetTransportInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID></u:GetTransportInfo>';
		var state = null;

		return this.request(TRANSPORT_ENDPOINT, action, body, 'u:GetTransportInfoResponse', function(err, data) {
			if (err) {
				callback(err);
				return;
			}

			var state = _this.translateState(data[0].CurrentTransportState[0]);

			return callback(err, state);
		});
	}

	/**
	* Get Current Position Info
	* @param	{Function} callback (err, info)
	*/
	getPositionInfo (callback) {
		debug('Sonos.positionInfo(%j)', callback);

		var avTransport = new Services.AVTransport(this.host, this.port);

		avTransport.GetPositionInfo({
			InstanceID: 0
		}, function (err, data) {
			callback(err, data);
		});
	}

	/**
	 * @param {String}
	 */
	translateState	(inputState) {
		switch(inputState) {
			case 'PAUSED_PLAYBACK':
				return 'paused';

			default:
				return inputState.toLowerCase();
		}
	}

	getAvailableServices (callback) {
		new Services.MusicServices(this.host).ListAvailableServices({ }, (err, data) => {
			if(err) {
				callback(err);
				return;
			}

			let servicesObj = xml2json(data.AvailableServiceDescriptorList, {
				explicitArray: true
			});

			let serviceDescriptors = servicesObj.Services.Service.map((obj) => {
				let out = _.assign({}, obj.$, obj.Policy[0].$);

				return {
					class: 'object.MusicService',
					title: out.Name,
					id: Number(out.Id),
					data: out,
				};
			});

			let services = [];

			data.AvailableServiceTypeList.split(',').forEach((t) => {
				let serviceId = Math.floor(Math.abs((t - 7) / 256)) || Number(t);
				let match = _.findWhere(serviceDescriptors, { id: serviceId });

				if(match) {
					services.push(match);
				}
			});

			console.log(services);
			callback(null, services);
		});
	}

}

export default Sonos;
