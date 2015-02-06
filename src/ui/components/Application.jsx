import port from '../port';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

// import all dependencies
import CurrentTrack from './CurrentTrack';
import QueueList from './QueueList';
import BrowserList from './BrowserList';
import PlayControls from './PlayControls';
import PositionInfo from './PositionInfo';
import VolumeControls from './VolumeControls';
import ZoneGroupList from './ZoneGroupList';

var history = [];

class Application {
	getInitialState () {
		return {
			currentZone: null,
			zoneGroups: [],

			coordinator: {
				host: null,
				port: null
			},
			currentTrack: {},
			nextTrack: {},
			volumeControls: {
				master: {
					volume: 0,
					muted: false
				},
				players: []
			},
			playState: {
				playing: false
			},
			queue: {
				returned: 0,
				total: 0,
				items: []
			},

			browserState: {
				source: null,
				searchType: null,
				headline: 'Select a Music Source',
				items: [
					{
						title: 'Sonos Favourites',
						source: 'favourites'
					},
					{
						title: 'Music Library',
						source: 'library'
					}
				]
			}
		};
	}

	selectCurrentZone (value) {
		this.cursor.merge({
			currentZone: value,

			currentTrack: {},

			playState: {
				playing: false
			},
			queue: {
				returned: 0,
				total: 0,
				items: []
			}
		});

		port.postMessage({
			type: 'selectZoneGroup',
			ZoneGroup: value
		});
	}

	playPrev () {
		port.postMessage({
			type: 'prev',
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	playNext () {
		port.postMessage({
			type: 'next',
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	queuelistGoto (target) {
		port.postMessage({
			type: 'goto',
			target: target,
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	toggleMute (id) {
		console.log('here', arguments);

		if(id === 'master-mute') {
			var msg = this.cursor.refine('volumeControls', 'master', 'mute').value ? 'group-unmute' : 'group-mute';
		} else {
			throw new Error("have't dealt with this yet");
		}

		port.postMessage({
			type: msg,
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	toggelPlaystate () {
		var msg = this.cursor.refine('playState', 'playing').value ? 'pause' : 'play';

		port.postMessage({
			type: msg,
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	volumeSet (params) {
		console.log('volumeSet', params.volume);

		port.postMessage({
			type: 'volumeSet',
			volume: params.volume,
			channel: params.channel,
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	browserAction (item) {
		var librarySearch = {
			headline: 'Browse Music Library',
			source: 'library',
			items: [
				{
					title: 'Artists',
					searchType: 'artists'
				},
				{
					title: 'Albums',
					searchType: 'albums'
				},
				{
					title: 'Composers',
					searchType: 'composers'
				},
				{
					title: 'Genres',
					searchType: 'genres'
				},
				{
					title: 'Tracks',
					searchType: 'tracks'
				},
				{
					title: 'Playlists',
					searchType: 'playlists'
				}
			]
		};

		var model = this.cursor.refine('browserState');
		var source = model.refine('source').value;

		if(!source && item.source === 'library') {

			model.set(librarySearch);

		} else if(source === 'library' && item.searchType) {

			this.prendinBrowserUpdate = {
				headline : item.title,
				searchType : item.searchType
			};

			port.postMessage({
				type: 'browse',
				host: this.cursor.refine('coordinator', 'host').value,
				searchType: item.searchType,
			});
		}
	}

	queryState () {
		port.postMessage({
			type: 'queryState',
			host: this.cursor.refine('coordinator', 'host').value
		});
	}

	delayedQueryState () {
		window.setTimeout(this.queryState.bind(this), 300);
	}

	isOk (msg) {
		return msg.host === this.cursor.refine('coordinator', 'host').value;
	}


	componentDidMount () {

		var self = this;
		var cursor = Cursor.build(this);
		this.cursor = cursor;

		this.subscribe('zonegroup:select', this.selectCurrentZone.bind('this'));

		this.subscribe('playstate:toggle', this.toggelPlaystate.bind('this'));
		this.subscribe('playstate:prev', this.playPrev.bind('this'));
		this.subscribe('playstate:next', this.playNext.bind('this'));

		this.subscribe('queuelist:goto', this.queuelistGoto.bind('this'));

		this.subscribe('browser:action', this.browserAction.bind('this'));

		this.subscribe('volume:togglemute', this.toggleMute.bind('this'));

		this.subscribe('volume:set', this.volumeSet.bind('this'));

		port.registerCallback('coordinator', function(msg) {
			console.log('coordinator---------------', msg.state);
			cursor.merge({
				coordinator:  msg.state
			});
		});

		port.registerCallback('volume', function(msg) {
			if(!self.isOk(msg)) {
				return;
			}

			cursor.refine('volumeControls', 'master', 'volume').set(msg.state);
		});

		port.registerCallback('browse', function(msg) {
			var state = self.prendinBrowserUpdate;
			state.items = msg.result.items;

			self.cursor.refine('browserState').set(state);
			self.prendinBrowserUpdate = null;
		});


		port.registerCallback('group-mute', function(msg) {
			cursor.refine('volumeControls', 'master', 'mute').set(msg.state);
		});

		port.registerCallback('topology', function(msg) {
			cursor.merge({
				zoneGroups: msg.state.ZoneGroups.ZoneGroup
			});

			if(!cursor.refine('currentZone').value) {
				self.selectCurrentZone(msg.state.ZoneGroups.ZoneGroup[0]);
			}
		});

		port.registerCallback('currentState', function(msg) {
			if(!self.isOk(msg)) {
				return;
			}

			if(msg.state === 'transitioning') {
				self.delayedQueryState();
				return;
			}

			cursor.refine('playState', 'playing').set(msg.state === 'playing');
		});

		port.registerCallback('currentTrack', function(msg) {
			if(!self.isOk(msg)) {
				return;
			}

			cursor.refine('currentTrack').set(msg.track);
		});

		port.registerCallback('nextTrack', function(msg) {
			if(!self.isOk(msg)) {
				return;
			}

			cursor.refine('nextTrack').set(msg.track);
		});

		port.registerCallback('queue', function(msg) {
			if(!self.isOk(msg)) {
				return;
			}

			cursor.refine('queue').set(msg.result);
		});
	}

	render () {
		var cursor = Cursor.build(this);

		var volumeControls = cursor.refine('volumeControls');

		var zoneGroups = cursor.refine('zoneGroups');
		var currentZone = cursor.refine('currentZone');

		var currentTrack = cursor.refine('currentTrack');
		var nextTrack = cursor.refine('nextTrack');
		var playState = cursor.refine('playState');
		var queue = cursor.refine('queue');

		var browserState = cursor.refine('browserState');

		return (
			<div id="application">
				<header id="top-control">

					<VolumeControls model={volumeControls} />

					<PlayControls model={playState} />
					<PositionInfo />

				</header>
				<div id="column-container">
					<div id="zone-container">
						<h4>ROOMS</h4>
						<ZoneGroupList currentZone={currentZone} zoneGroups={zoneGroups} />
			 		</div>
					<div id="status-container">

						<h4 id="now-playing">NOW PLAYING</h4>
						<CurrentTrack currentTrack={currentTrack} nextTrack={nextTrack} />

						<h4 id="queue">QUEUE</h4>
						<div id="queue-list-container">
							<QueueList model={queue} />
						</div>

					</div>

					<BrowserList model={browserState} />
				</div>
			</div>
		);
	}
}

Application.prototype.mixins = [
	EventableMixin
];
export default React.createClass(Application.prototype);
