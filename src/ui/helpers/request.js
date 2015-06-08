var reg = /^(\w+): (.+)/;

var request = function (options, callback) {

	var xhr = new XMLHttpRequest();

	xhr.open(options.method || 'GET', options.uri || options.url);

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
				}, xhr.responseText);
			}
		}
	}

	xhr.send(options.body || null);
};

export default request;