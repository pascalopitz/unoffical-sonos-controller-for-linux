import Service from './Service';

class MusicServices extends Service {

	constructor (host, port) {
		super({
			name : 'MusicServices',
			host : host,
			port : port || 1400,
			controlURL : '/MediaRenderer/MusicServices/Control',
			eventSubURL : '/MediaRenderer/MusicServices/Event',
			SCPDURL : '/xml/MusicServices1.xml',
		});
	}

	GetSessionId (options, callback) {
		this._request('GetSessionId', options, callback);
	}

	ListAvailableServices (options, callback) {
		this._request('ListAvailableServices', options, callback);
	}

	UpdateAvailableServices (options, callback) {
		this._request('UpdateAvailableServices', options, callback);
	}
}

export default MusicServices;