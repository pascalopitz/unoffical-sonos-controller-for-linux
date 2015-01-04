import Service from './Service';
import Services from '../helpers/Services';


class ContentDirectory extends Service {

	constructor (host, port) {
		this.name = 'ContentDirectory';
		this.host = host;
		this.port = port || 1400;
		this.controlURL = '/MediaServer/ContentDirectory/Control';
		this.eventSubURL = '/MediaServer/ContentDirectory/Event';
		this.SCPDURL = '/xml/ContentDirectory1.xml';
	}

	Browse (options, callback) {
		this._request('Browse', options, callback);
	}
};


export default ContentDirectory;