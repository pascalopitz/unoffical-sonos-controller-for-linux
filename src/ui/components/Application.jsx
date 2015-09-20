import React from 'react';

import SonosService from '../services/SonosService';

import CurrentTrack from './CurrentTrack';
import QueueList from './QueueList';
import BrowserList from './BrowserList';
import PlayControls from './PlayControls';
import PositionInfo from './PositionInfo';
import VolumeControls from './VolumeControls';
import ZoneGroupList from './ZoneGroupList';
import GroupManagement from './GroupManagement';
import MusicServiceManagement from './MusicServiceManagement';
import SearchBar from './SearchBar';
import Loader from './Loader';

let history = [];

class Application extends React.Component {

	componentDidMount () {
		SonosService.mount();
	}

	render () {

		return (
			<div>
				<div id="application">
					<header id="top-control">
						<VolumeControls />
						<PlayControls />
						<PositionInfo />
						<SearchBar />
					</header>
					<div id="column-container">
						<div id="zone-container">
							<h4>ROOMS</h4>
							<ZoneGroupList />
				 		</div>
						<div id="status-container">

							<h4 id="now-playing">NOW PLAYING</h4>
							<CurrentTrack />

							<h4 id="queue">QUEUE</h4>
							<QueueList />
						</div>

						<BrowserList />
					</div>
				</div>
				<GroupManagement />
				<MusicServiceManagement />
				<Loader />
			</div>
		);
	}
}

export default Application;
