import Service from './Service';

class GroupManagement extends Service {

	constructor (host, port) {
		this.name = 'GroupManagement';
		this.host = host;
		this.port = port || 1400;
		this.controlURL = '/MediaRenderer/GroupManagement/Control';
		this.eventSubURL = '/MediaRenderer/GroupManagement/Event';
		this.SCPDURL = '/xml/GroupManagement1.xml';
	}

	SetMuted (muted, callback) {
		this._request('SetGroupMute', {
			InstanceID: 0,
			Channel: 'Master',
			DesiredMute: muted
		}, callback);
	}

	AddMember (options, callback) {
		this._request('AddMember', options, callback);
	}

	RemoveMember (options, callback) {
		this._request('RemoveMember', options, callback);
	}

	ReportTrackBufferingResult (options, callback) {
		this._request('ReportTrackBufferingResult', options, callback);
	}
};


export default GroupManagement;