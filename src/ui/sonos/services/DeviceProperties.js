import Service from './Service';

class DeviceProperties extends Service {

	constructor (host, port) {
		super({
			name : 'DeviceProperties',
			host : host,
			port : port || 1400,
			controlURL : '/MediaRenderer/DeviceProperties/Control',
			eventSubURL : '/MediaRenderer/DeviceProperties/Event',
			SCPDURL : '/xml/DeviceProperties1.xml',		
		});
	}

	SetLEDState (options, callback) {
		this._request('SetLEDState', options, callback);
	}

	GetLEDState (options, callback) {
		this._request('GetLEDState', options, callback);
	}

	SetInvisible (options, callback) {
		this._request('SetInvisible', options, callback);
	}

	GetInvisible (options, callback) {
		this._request('GetInvisible', options, callback);
	}

	AddBondedZones (options, callback) {
		this._request('AddBondedZones', options, callback);
	}

	RemoveBondedZones (options, callback) {
		this._request('RemoveBondedZones', options, callback);
	}

	CreateStereoPair (options, callback) {
		this._request('CreateStereoPair', options, callback);
	}

	SeparateStereoPair (options, callback) {
		this._request('SeparateStereoPair', options, callback);
	}

	SetZoneAttributes (options, callback) {
		this._request('SetZoneAttributes', options, callback);
	}

	GetZoneAttributes (options, callback) {
		this._request('GetZoneAttributes', options, callback);
	}

	GetHouseholdID (options, callback) {
		this._request('GetHouseholdID', options, callback);
	}

	GetZoneInfo (options, callback) {
		this._request('GetZoneInfo', options, callback);
	}

	SetAutoplayLinkedZones (options, callback) {
		this._request('SetAutoplayLinkedZones', options, callback);
	}

	GetAutoplayLinkedZones (options, callback) {
		this._request('GetAutoplayLinkedZones', options, callback);
	}

	SetAutoplayRoomUUID (options, callback) {
		this._request('SetAutoplayRoomUUID', options, callback);
	}

	GetAutoplayRoomUUID (options, callback) {
		this._request('GetAutoplayRoomUUID', options, callback);
	}

	SetAutoplayVolume (options, callback) {
		this._request('SetAutoplayVolume', options, callback);
	}

	GetAutoplayVolume (options, callback) {
		this._request('GetAutoplayVolume', options, callback);
	}

	ImportSetting (options, callback) {
		this._request('ImportSetting', options, callback);
	}

	SetUseAutoplayVolume (options, callback) {
		this._request('SetUseAutoplayVolume', options, callback);
	}

	GetUseAutoplayVolume (options, callback) {
		this._request('GetUseAutoplayVolume', options, callback);
	}

	AddHTSatellite (options, callback) {
		this._request('AddHTSatellite', options, callback);
	}

	RemoveHTSatellite (options, callback) {
		this._request('RemoveHTSatellite', options, callback);
	}
};


export default DeviceProperties;


