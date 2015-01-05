var map = {};

class Media {
	urlToData (url, callback) {

		if(map[url]) {
			callback(map[url]);
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);

   		// Must include this line - specifies the response type we want
		xhr.responseType = 'arraybuffer';

		xhr.onload = function () {
	        var arr = new Uint8Array(this.response);


	        // Convert the int array to a binary string
	        // We have to use apply() as we are converting an *array*
	        // and String.fromCharCode() takes one or more single values, not
	        // an array.
	        var raw = String.fromCharCode.apply(null,arr);

	        // This works!!!
	        var b64=btoa(raw);
	        var dataURL="data:image/jpeg;base64,"+b64;


			map[url] = dataURL;
			callback(map[url]);				
		};

		xhr.send();
	}
}

var instance = new Media();

export default function () {
	return instance;
};