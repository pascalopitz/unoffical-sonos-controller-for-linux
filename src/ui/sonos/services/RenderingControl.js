import Service from './Service';

class RenderingControl extends Service {

	constructor (host, port) {
		super({
			name : 'RenderingControl',
			host : host,
			port : port || 1400,
			controlURL : '/MediaRenderer/RenderingControl/Control',
			eventSubURL : '/MediaRenderer/RenderingControl/Event',
			SCPDURL : '/xml/RenderingControl1.xml',
		});
	}

	GetVolume (options, callback) {
		this._request('GetVolume', options, callback);
	}

	SetVolume (options, callback) {
		this._request('SetVolume', options, callback);
	}
}

export default RenderingControl;
