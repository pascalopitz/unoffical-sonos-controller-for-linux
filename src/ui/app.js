import React from 'react';
import ReactDOM from 'react-dom';
import Application from './components/Application';

import remoteLogger from './helpers/remoteLogger';

// initialise deviceID from local storage
remoteLogger.init(() => {

	ReactDOM.render(
		React.createElement(Application, null),
		document.getElementById('root')
	);

	/*
	Should you wonder what this  stuff below is, and why there is remote logging:

	I had bad reviews on the Chrome Store for the app not starting up.
	I figured this has to do with the network config, so I am logging some basic data about it.
	This all goes into a Google Speadspeet, because I am cheap.

	Logged data is window.navigator, chrome.system.network.getNetworkInterfaces and additional errors

	No, I am not selling this data to anybody.
	*/

	// log navigator info
	let navigatorInfo = {};

	let navigatorFields = [
		'appCodeName',
		'appName',
		'appVersion',
		'language',
		'product',
		'productSub',
		'userAgent',
	];

	navigatorFields.forEach((f) => {
		navigatorInfo[f] = window.navigator[f];
	});

	remoteLogger.log('navigatorInfo', navigatorInfo);

	// log network info
	chrome.system.network.getNetworkInterfaces((interfaces) => {
		remoteLogger.log('interfaces', interfaces);
	});


	// log uncaught errors
	window.onerror = (errorMsg, url, lineNumber, column, errorObj) => {
		remoteLogger.log('error', errorObj.stack);
	};
});
