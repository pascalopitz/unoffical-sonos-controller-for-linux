import Service from './Service';

class AudioIn extends Service {
    constructor(host, port) {
        super({
            name: 'Queue',
            host: host,
            port: port || 1400,
            controlURL: '/Queue/Control',
            eventSubURL: '/Queue/Event',
            SCPDURL: '/xml/Queue1.xml'
        });
    }

    AddURI(options, callback) {
        this._request('AddURI', options, callback);
    }

    AddMultipleURIs(options, callback) {
        this._request('AddMultipleURIs', options, callback);
    }

    AttachQueue(options, callback) {
        this._request('AttachQueue', options, callback);
    }

    Backup(options, callback) {
        this._request('Backup', options, callback);
    }

    Browse(options, callback) {
        this._request('Browse', options, callback);
    }

    CreateQueue(options, callback) {
        this._request('CreateQueue', options, callback);
    }

    RemoveAllTracks(options, callback) {
        this._request('RemoveAllTracks', options, callback);
    }

    RemoveTrackRange(options, callback) {
        this._request('RemoveTrackRange', options, callback);
    }

    ReorderTracks(options, callback) {
        this._request('ReorderTracks', options, callback);
    }

    ReplaceAllTracks(options, callback) {
        this._request('ReplaceAllTracks', options, callback);
    }

    SaveAsSonosPlaylist(options, callback) {
        this._request('SaveAsSonosPlaylist', options, callback);
    }
}

export default AudioIn;
