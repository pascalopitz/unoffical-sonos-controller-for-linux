import port from '../port';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

// import all dependencies
import CurrentTrack from './CurrentTrack'; 
import QueueList from './QueueList'; 
import BrowserList from './BrowserList'; 
import PlayControls from './PlayControls'; 
import VolumeControls from './VolumeControls'; 
import ZoneGroupList from './ZoneGroupList'; 


class Application {
	getInitialState() {
		return {
			currentZone: null,
			zoneGroups: [],
			currentTrack: {},
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
			queue: []			
		};
	}

	selectCurrentZone (value) {		
		var cursor = Cursor.build(this);

		this.cursor.merge({
			currentZone: value
		});

		port.postMessage({
			type: 'selectZoneGroup',
			ZoneGroup: this.cursor.refine('currentZone')
		});
	}

	componentDidMount () {

		var self = this;
		var cursor = Cursor.build(this);
		this.cursor = cursor;


		this.subscribe('zonegroup:select', this.selectCurrentZone.bind('this'));

		port.registerCallback('coordinator', function(msg) {
			cursor.merge({
				coordinator:  msg.state
			});
		});

		port.registerCallback('volume', function(msg) {
			cursor.merge({
				volume: msg.state
			});
		});

		port.registerCallback('browse', function(msg) {
			console.log(arguments);
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
			if(msg.state === 'transitioning') {
				window.setTimeout(function () {
					port.postMessage({
						type: 'queryState',
						host: model.coordinator.host,
					});
				}, 300);

				return;
			}

			cursor.merge({
				playState: {
					playing: msg.state === 'playing'
				}
			});
		});

		port.registerCallback('currentTrack', function(msg) {
			cursor.merge({
				currentTrack: msg.track
			});
		});

		port.registerCallback('queue', function(msg) {
			cursor.merge({
				queue: msg.result
			});
		});
	}

	render () {
		var cursor = Cursor.build(this);

		var volumeControls = cursor.refine('volumeControls');

		var zoneGroups = cursor.refine('zoneGroups');
		var currentZone = cursor.refine('currentZone');

		var currentTrack = cursor.refine('currentTrack');
		var playState = cursor.refine('playState');
		var queue = cursor.refine('queue');
	
		return (
			<div id="application">
				<header id="top-control">

					<VolumeControls model={volumeControls} />
					<PlayControls model={playState} />

					<div id="position-info">
						<img className="left" src="images/tc_progress_container_left.png" />
						<img className="right" src="images/tc_progress_container_right.png" />
						<div className="content">
							<img id="repeat" className="playback-mode" src="images/tc_progress_repeat_normal_off.png" />
							<img id="shuffle"  className="playback-mode" src="images/tc_progress_shuffle_normal_off.png" />
							<img id="crossfade"  className="playback-mode" src="images/tc_progress_crossfade_normal_off.png" />
							<span id="countup">0:00</span>
								<div id="position-info-control">
									<div id="position-bar">
										<div id="position-bar-scrubber"></div>
									</div>
								</div>
							<span id="countdown">-0:00</span>
						</div>

					</div>
				</header>
				<div id="column-container">
					<div id="zone-container">
						<h4>ROOMS</h4>
						<ZoneGroupList currentZone={currentZone} zoneGroups={zoneGroups} />
			 		</div>
					<div id="status-container">

						<h4 id="now-playing">NOW PLAYING</h4>
						<CurrentTrack track={currentTrack} />

						<h4 id="queue">QUEUE</h4>
						<div id="queue-list-container">
							<QueueList items={queue} />
						</div>

					</div>

					<BrowserList />
				</div>
			</div>
		);
	}
}

Application.prototype.mixins = [
	EventableMixin
];
export default React.createClass(Application.prototype);