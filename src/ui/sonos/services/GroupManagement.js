import Service from './Service';

class GroupManagement extends Service {
    constructor(host, port) {
        super({
            name: 'GroupManagement',
            host: host,
            port: port || 1400,
            controlURL: '/GroupManagement/Control',
            eventSubURL: '/GroupManagement/Event',
            SCPDURL: '/xml/GroupManagement1.xml'
        });
    }

    SetMuted(muted, callback) {
        this._request(
            'SetGroupMute',
            {
                InstanceID: 0,
                Channel: 'Master',
                DesiredMute: muted
            },
            callback
        );
    }

    AddMember(options, callback) {
        this._request('AddMember', options, callback);
    }

    RemoveMember(options, callback) {
        this._request('RemoveMember', options, callback);
    }

    ReportTrackBufferingResult(options, callback) {
        this._request('ReportTrackBufferingResult', options, callback);
    }
}

export default GroupManagement;
