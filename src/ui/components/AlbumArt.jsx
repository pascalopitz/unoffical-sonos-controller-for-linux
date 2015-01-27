import model from '../model';

var React = require('react/addons');

// var queue = [];
// var fetching = 0;

// const maxFetching = 5;

// function urlToData(url, callback) {

// 	var xhr = new XMLHttpRequest();
// 	xhr.open('GET', url, true);

// 		// Must include this line - specifies the response type we want
// 	xhr.responseType = 'arraybuffer';

// 	xhr.onload = function () {
//         var arr = new Uint8Array(this.response);

// 		// Convert the int array to a binary string
// 		// We have to use apply() as we are converting an *array*
// 		// and String.fromCharCode() takes one or more single values, not
// 		// an array.
// 		var raw = String.fromCharCode.apply(null,arr);

// 		// This works!!!
// 		var b64=btoa(raw);
// 		var dataURL="data:image/jpeg;base64,"+b64;

// 		callback(dataURL);
// 	};

// 	xhr.send();	
// }

// function processQueue() {
// 	if(!fetching < maxFetching && queue.length) {
// 		var item = queue.shift();

// 		fetching = fetching + 1;

// 		urlToData(item.url, function (dataUrl) {
// 			fetching = fetching - 1;
// 			item.callback(dataUrl);

// 			if(queue.length) {
// 				processQueue();
// 			}
// 		})	
// 	}
// }

// window.setInterval(processQueue, 1000);

// function queueFetch (url, callback) {
// 	queue.push({
// 		url: url,
// 		callback: callback
// 	});
// 	processQueue();
// }

class AlbumArt {

	getInitialState () {
		return {
			src: 'images/browse_missing_album_art.png',
			fetched: false,
		};
	}

	render () {
		var self = this;

		var id = this.props.id || '';

		// if(!this.state.fetched && this.props.src) {
		// 	var srcUrl = 'http://' + model.coordinator.host + ':' + model.coordinator.port + decodeURIComponent(this.props.src);
		// }

		return (
			<img
			id={id}
			src={this.state.src} />
		);
	}
}

AlbumArt.prototype.displayName = "AlbumArt";
export default React.createClass(AlbumArt.prototype);