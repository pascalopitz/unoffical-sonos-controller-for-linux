var reg = /^(\w+): (.+)/;

var request = function (options, callback) {

	var xhr = new XMLHttpRequest();

	if(typeof options === 'string') {
		options = {
			uri: options,
		}
	}

	xhr.open(options.method || 'GET', options.uri || options.url);

	if(options.responseType) {
		xhr.responseType = options.responseType;
	}

	if(options.headers) {
		for(var k in options.headers) {
			if(options.headers.hasOwnProperty(k)) {
				xhr.setRequestHeader(k, options.headers[k]);
			}
		}
	}

	xhr.onreadystatechange = function() {
		var headers = {};

		if (xhr.readyState == 4) {

			let response = xhr.responseType === 'blob' ? xhr.response : xhr.responseText;

			if (xhr.status === 200) {

				xhr.getAllResponseHeaders().split('\n').forEach(function (l) {
					var matches = reg.exec(l);

					if(matches) {
						headers[String(matches[1]).toLowerCase()] = matches[2];
					}
				});

				callback(null, {
					statusCode: xhr.status,
					headers: headers
				}, response);
			} else {
				callback(xhr.status, {
					statusCode: xhr.status,
					headers: headers
				}, response);
			}
		}
	}

	xhr.send(options.body || null);
};

export default request;
