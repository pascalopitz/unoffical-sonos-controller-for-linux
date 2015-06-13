import events from 'events';
import _ from "lodash";

import Dispatcher from '../dispatcher/AppDispatcher'
import Constants from '../constants/Constants'

import SonosService from '../services/SonosService'
import RAL from "apps-resource-loader";

const CHANGE_EVENT = 'change';

RAL.Debugger.activate();
RAL.Queue.skipOnError(true);
RAL.Queue.setMaxConnections(2);

var AlbumArtStore = _.assign({}, events.EventEmitter.prototype, {

	_loaded: {},

	emitChange () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener (listener) {
		this.on(CHANGE_EVENT, listener);
	},

	load (url) {
		let sonos = SonosService._currentDevice;
		var srcUrl = 'http://' + sonos.host + ':' + sonos.port + decodeURIComponent(url);

		var finalImage = new RAL.RemoteImage({
			src: srcUrl,
			priority: RAL.Queue.getNextHighestPriority(),
		});

		finalImage.addEventListener('loaded', (info) => {
			this._loaded[url] = info.data;
			this.emitChange();
		});

		finalImage.addEventListener('remoteunavailable', (info) => {
			this._loaded[url] = null;
			this.emitChange();
		});

		RAL.Queue.add(finalImage);
		RAL.Queue.start();
	},

	getByUrl(url) {
		if(url && this._loaded[url]) {
			return this._loaded[url];
		}

		window.setTimeout(() => {
			if(url && this._loaded[url] === undefined) {
				this.load(url);
			}
		}, 300);

		return 'images/browse_missing_album_art.png';
	}
});

AlbumArtStore.setMaxListeners(10000000);

export default AlbumArtStore;

