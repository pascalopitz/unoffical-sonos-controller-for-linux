import port from './port';
import model from './model';

import CurrentTrack from './components/CurrentTrack'; 
import QueueList from './components/QueueList'; 
import BrowserList from './components/BrowserList'; 
import PlayControls from './components/PlayControls'; 
import VolumeControls from './components/VolumeControls'; 
import ZoneGroupList from './components/ZoneGroupList'; 

import React from 'react/addons';
import { Cursor }  from 'react-cursor';

console.log(Cursor)

port.registerCallback('coordinator', function(msg) {
	model.coordinator = msg.state;
});

port.registerCallback('volume', function(msg) {
	model.volume = msg.state;
});

port.registerCallback('browse', function(msg) {
	console.log(arguments);
});


port.registerCallback('topology', function(msg) {
	model.zoneGroups = msg.state.ZoneGroups.ZoneGroup;

	if(!model.currentZone) {
		model.currentZone = msg.state.ZoneGroups.ZoneGroup[0];
	}
});

port.registerCallback('currentState', function(msg) {
	if(msg.state === 'transitioning') {
		window.setTimeout(function () {
			port.postMessage({
				type: 'queryState',
				host: model.coordinator.host,
			});
		}, 200);

		return;
	}

	model.currentState = msg.state;
});

port.registerCallback('currentTrack', function(msg) {
	model.currentTrack = msg.track;
});

port.registerCallback('queue', function(msg) {
	model.queue = msg.result;
});


model.observe('currentZone', function () {
	port.postMessage({
		type: 'selectZoneGroup',
		ZoneGroup: model.currentZone
	});
});


React.render(
	React.createElement(CurrentTrack, null),
	document.getElementById('current-track-container')
)

React.render(
	React.createElement(QueueList, null),
	document.getElementById('queue-list-container')
)

React.render(
	React.createElement(BrowserList, null),
	document.getElementById('music-sources-container')
)

React.render(
	React.createElement(PlayControls, null),
	document.getElementById('play-controls-container')
);

React.render(
	React.createElement(VolumeControls, null),
	document.getElementById('volume-controls-container')
);

React.render(
	React.createElement(ZoneGroupList, null),
	document.getElementById('zone-list-container')
);