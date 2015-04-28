import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import Application from './components/Application';
import sonos from './sonos-coordinator';

React.render(
	React.createElement(Application, null),
	document.getElementById('root')
);
