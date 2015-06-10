import React from 'react/addons';

import SonosService from '../services/SonosService'

var cache = {};
var queue = [];
var fetching = 0;

const maxFetching = 2;

// TODO: look into https://gist.github.com/mseeley/9321422
// OR https://github.com/GoogleChrome/apps-resource-loader/blob/master/lib/ral.min.js
// https://gist.github.com/maicki/7622137

// function urlToData(url, callback) {

// 	var xhr = new XMLHttpRequest();
// 	xhr.open('GET', url, true);

// 		// Must include this line - specifies the response type we want
// 	xhr.responseType = 'arraybuffer';

// 	xhr.onload = function () {
// 		var arr = new Uint8Array(this.response);

// 		if(!arr.length) {
// 			window.setTimeout(() => {
// 				callback(null);
// 			}, 10);
// 			return;
// 		}

// 		// Convert the int array to a binary string
// 		// We have to use apply() as we are converting an *array*
// 		// and String.fromCharCode() takes one or more single values, not
// 		// an array.
// 		try {
// 			var raw = String.fromCharCode.apply(null,arr);
// 		} catch(e) {
// 			window.setTimeout(() => {
// 				callback(null);
// 			}, 10);
// 			return;
// 		}

// 		// This works!!!
// 		var b64=btoa(raw);
// 		var dataURL="data:image/jpeg;base64,"+b64;

// 		window.setTimeout(() => {
// 			callback(dataURL);
// 		}, 10);
// 	};

// 	xhr.send();	
// }

// function processQueue() {
// 	if(fetching < maxFetching && queue.length) {
// 		var item = queue.shift();

// 		fetching = fetching + 1;

// 		urlToData(item.url, function (dataUrl) {
// 			fetching = fetching - 1;
// 			item.callback(dataUrl);

// 			cache[item.url] = dataUrl;

// 			if(queue.length) {
// 				window.setTimeout(processQueue, 50);
// 			}
// 		})
// 	}
// }

// function queueFetch (url, callback) {
// 	if(cache[url] !== undefined) {
// 		window.setTimeout(() => {
// 			callback(cache[url]);
// 		}, 10);
// 		return;
// 	}
// 	queue.push({
// 		url: url,
// 		callback: callback
// 	});
// 	processQueue();
// }

class AlbumArt extends React.Component {

	constructor () {
		super();
		this.state = {
			src: 'images/browse_missing_album_art.png',
			fetched: false,
		};
	}

	componentWillReceiveProps() {
		this.setState({
			src: 'images/browse_missing_album_art.png',
			fetched: false,
		});
	}

	render () {
		let sonos = SonosService._currentDevice;
		var self = this;

		var id = this.props.id || '';

		if(!this.state.fetched && this.props.src) {
			var srcUrl = 'http://' + sonos.host + ':' + sonos.port + decodeURIComponent(this.props.src);

			// queueFetch(srcUrl, (dataUri) => {
			// 	if(!dataUri) {
			// 		this.setState({
			// 			fetched: true
			// 		});
			// 	} else {
			// 		this.setState({
			// 			src : dataUri,
			// 			fetched: true
			// 		});
			// 	}
			// });
		}

		return (
			<img
			id={id}
			src={this.state.src} />
		);
	}
}

export default AlbumArt;