import Service from './Service';

class AlarmClock extends Service {

	constructor (host, port) {
		super({
			name : 'AlarmClock',
			host : host,
			port : port || 1400,
			controlURL : '/MediaRenderer/AlarmClock/Control',
			eventSubURL : '/MediaRenderer/AlarmClock/Event',
			SCPDURL : '/xml/AlarmClock1.xml',
		});
	}

	SetFormat (options, callback) {
		this._request('SetFormat', options, callback);
	}

	GetFormat (options, callback) {
		this._request('GetFormat', options, callback);
	}

	SetTimeZone (options, callback) {
		this._request('SetTimeZone', options, callback);
	}

	GetTimeZone (options, callback) {
		this._request('GetTimeZone', options, callback);
	}

	GetTimeZoneAndRule (options, callback) {
		this._request('GetTimeZoneAndRule', options, callback);
	}

	GetTimeZoneRule (options, callback) {
		this._request('GetTimeZoneRule', options, callback);
	}

	SetTimeServer (options, callback) {
		this._request('SetTimeServer', options, callback);
	}

	GetTimeServer (options, callback) {
		this._request('GetTimeServer', options, callback);
	}

	SetTimeNow (options, callback) {
		this._request('SetTimeNow', options, callback);
	}

	GetHouseholdTimeAtStamp (options, callback) {
		this._request('GetHouseholdTimeAtStamp', options, callback);
	}

	GetTimeNow (options, callback) {
		this._request('GetTimeNow', options, callback);
	}

	CreateAlarm (options, callback) {
		this._request('CreateAlarm', options, callback);
	}

	UpdateAlarm (options, callback) {
		this._request('UpdateAlarm', options, callback);
	}

	DestroyAlarm (options, callback) {
		this._request('DestroyAlarm', options, callback);
	}

	ListAlarms (options, callback) {
		this._request('ListAlarms', options, callback);
	}

	SetDailyIndexRefreshTime (options, callback) {
		this._request('SetDailyIndexRefreshTime', options, callback);
	}

	GetDailyIndexRefreshTime (options, callback) {
		this._request('GetDailyIndexRefreshTime', options, callback);
	}
}; 


export default AlarmClock;