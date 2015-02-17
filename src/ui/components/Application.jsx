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

import initialState from '../initialState';

var history = [];

class Application {
	getInitialState () {
		return initialState;
	}

	isOk (msg) {
		return msg.host === this.cursor.refine('coordinator', 'host').value;
	}


	componentDidMount () {
		var cursor = Cursor.build(this);
		this.cursor = cursor;

		this.trigger('application:mount', this, cursor);
	}

	render () {
		var cursor = Cursor.build(this);

		var volumeControls = cursor.refine('volumeControls');

		var zoneGroups = cursor.refine('zoneGroups');
		var currentZone = cursor.refine('currentZone');

		var positionInfo = cursor.refine('positionInfo');
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
					<PositionInfo info={positionInfo} />

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
