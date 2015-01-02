var request = function (options, callback) {

  var xhr = new XMLHttpRequest();

  xhr.open(options.method || 'GET', options.uri);

  if(options.headers) {
	  for(var k in options.headers) {
	  	if(options.headers.hasOwnProperty(k)) {
		  xhr.setRequestHeader(k, options.headers[k]);	  		
	  	}
	  }  	
  }

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status === 200) {
      	callback(null, { statusCode: xhr.status }, xhr.responseText);
      }
    }
  }

  xhr.send(options.body || null);
};

export default request;