var peerSockMap = {}
var decoder = new TextDecoder();

function tcpReceive(info) {
	if (peerSockMap[info.socketId]) {
		peerSockMap[info.socketId].receive(info);
	}
}

chrome.sockets.tcp.onReceive.addListener(tcpReceive);
chrome.sockets.tcp.onReceiveError.addListener(tcpReceive);

class Request {
	constructor (opts) {
		this.method = opts.method
		this.uri = opts.uri
		this.version = opts.version
		this.connection = opts.connection
		this.headers = opts.headers

		this.arguments = {}
		var idx = this.uri.indexOf('?')
		if (idx != -1) {
			this.path = decodeURI(this.uri.slice(0,idx))
			var s = this.uri.slice(idx+1)
			var parts = s.split('&')

			for (var i=0; i<parts.length; i++) {
				var p = parts[i]
				var idx2 = p.indexOf('=')
				this.arguments[decodeURIComponent(p.slice(0,idx2))] = decodeURIComponent(p.slice(idx2+1,s.length))
			}
		} else {
			this.path = decodeURI(this.uri)
		}

		this.origpath = this.path

		if (this.path[this.path.length-1] == '/') {
			this.path = this.path.slice(0,this.path.length-1)
		}
		
	}

	isKeepAlive () {
		return this.headers['connection'] && this.headers['connection'].toLowerCase() != 'close'
	}
}


class IncomingStream {
	constructor (socketId, closeCallback) {

		this.socketId = socketId;
		this.closedCallbackTriggered = false;
		this.closeCallback = closeCallback;

		this.textBuffer = [];

		peerSockMap[this.socketId] = this
		chrome.sockets.tcp.setPaused(this.socketId, false, function () {
			// noop
		})
	}

	receive (evt) {

		if(evt.data && evt.data instanceof ArrayBuffer) {
			this.textBuffer += decoder.decode(new DataView(evt.data));
		}

		var request = this.parse(this.textBuffer);

		if(request.headers['content-length'] && request.headers['content-length'] <= request.body.length) {
			this.closeCallback.call(null, request);
			this.closedCallbackTriggered = true;			
		}

		if (evt.resultCode == 0) {
			//this.error({message:'remote closed connection'})
			console.log('remote closed connection (halfduplex)', this)
		} else if (evt.resultCode < 0 && !this.closedCallbackTriggered) {
			// TODO: check for content-length and prevent the current lag
			this.closeCallback.call(null, request);
		}
	}

	parseHeaders (lines) {
		var headers = {}
		var reg = /^([\w-_\s]+)\:(.+)/;

		lines.forEach(function (l) {
			var matches = reg.exec(l);
			headers[matches[1].toLowerCase()] = matches[2].trim()
		});

		return headers;
	}

	parse (str) {
		var parts = str.split('\r\n\r\n');

		var datastr = parts.shift();
		var lines = datastr.split('\r\n');
		var firstline = lines[0];
		var flparts = firstline.split(' ');
		var method = flparts[0];
		var uri = flparts[1];
		var version = flparts[2];

		var headers = this.parseHeaders(lines.slice(1))
		var request = {
			headers: headers,
			method: method,
			uri: uri,
			version: version,
			body: parts.join('\r\n\r\n')
		};	

		return request;
	}
}

export default IncomingStream;