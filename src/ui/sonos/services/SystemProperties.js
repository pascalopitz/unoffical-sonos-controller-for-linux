import Service from './Service';

class SystemProperties extends Service {

	constructor (host, port) {
		super({
			name : 'SystemProperties',
			host : host,
			port : port || 1400,
			controlURL : '/SystemProperties/Control',
			eventSubURL : '/SystemProperties/Event',
			SCPDURL : '/xml/SystemProperties1.xml',
		});
	}

	SetString (options, callback) {
		this._request('SetString', options, callback);
	}

	SetStringX (options, callback) {
		this._request('SetStringX', options, callback);
	}

	GetString (options, callback) {
		this._request('GetString', options, callback);
	}

	GetStringX (options, callback) {
		this._request('GetStringX', options, callback);
	}

	Remove (options, callback) {
		this._request('Remove', options, callback);
	}

	RemoveX (options, callback) {
		this._request('RemoveX', options, callback);
	}

	GetWebCode (options, callback) {
		this._request('GetWebCode', options, callback);
	}

	ProvisionTrialAccount (options, callback) {
		this._request('ProvisionTrialAccount', options, callback);
	}

	ProvisionCredentialedTrialAccountX (options, callback) {
		this._request('ProvisionCredentialedTrialAccountX', options, callback);
	}

	MigrateTrialAccountX (options, callback) {
		this._request('MigrateTrialAccountX', options, callback);
	}

	AddAccountX (options, callback) {
		this._request('AddAccountX', options, callback);
	}

	AddAccountWithCredentialsX (options, callback) {
		this._request('AddAccountWithCredentialsX', options, callback);
	}

	RemoveAccount (options, callback) {
		this._request('RemoveAccount', options, callback);
	}

	EditAccountPasswordX (options, callback) {
		this._request('EditAccountPasswordX', options, callback);
	}

	EditAccountMd (options, callback) {
		this._request('EditAccountMd', options, callback);
	}

	DoPostUpdateTasks (options, callback) {
		this._request('DoPostUpdateTasks', options, callback);
	}

	ResetThirdPartyCredentials (options, callback) {
		this._request('ResetThirdPartyCredentials', options, callback);
	}
}

export default SystemProperties;
