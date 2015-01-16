import port from './services/port';
import model from './model';

port.registerCallback('volume', function(msg) {
	model.volume = msg.state;
});

port.registerCallback('topology', function(msg) {
  model.zoneGroups = msg.state.ZoneGroups.ZoneGroup;
});

model.observe('currentZone', function () {
	port.postMessage({
		type: 'selectZoneGroup',
		ZoneGroup: model.currentZone
	});
});


import VolumeControls from './components/VolumeControls'; 

React.render(
  React.createElement(VolumeControls, null),
  document.getElementById('volume-controls-container')
);

import ZoneGroupList from './components/ZoneGroupList'; 

React.render(
  React.createElement(ZoneGroupList, null),
  document.getElementById('zone-container')
);