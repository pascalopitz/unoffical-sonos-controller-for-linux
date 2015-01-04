import Service from './Service';
import Services from '../helpers/Services';


class MusicServices extends Service {

	constructor (host, port) {
		this.name = 'MusicServices';
		this.host = host;
		this.port = port || 1400;
		this.controlURL = '/MediaRenderer/MusicServices/Control';
		this.eventSubURL = '/MediaRenderer/MusicServices/Event';
		this.SCPDURL = '/xml/MusicServices1.xml';
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
};


export default MusicServices;