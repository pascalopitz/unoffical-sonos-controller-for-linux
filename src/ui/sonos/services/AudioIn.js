import Service from './Service';

class AudioIn extends Service {
    constructor(host, port) {
        super({
            name: 'AudioIn',
            host: host,
            port: port || 1400,
            controlURL: '/AudioIn/Control',
            eventSubURL: '/AudioIn/Event',
            SCPDURL: '/xml/AudioIn1.xml'
        });
    }

    StartTransmissionToGroup(options, callback) {
        this._request('StartTransmissionToGroup', options, callback);
    }

    StopTransmissionToGroup(options, callback) {
        this._request('StopTransmissionToGroup', options, callback);
    }

    SetAudioInputAttributes(options, callback) {
        this._request('SetAudioInputAttributes', options, callback);
    }

    GetAudioInputAttributes(options, callback) {
        this._request('GetAudioInputAttributes', options, callback);
    }

    SetLineInLevel(options, callback) {
        this._request('SetLineInLevel', options, callback);
    }

    GetLineInLevel(options, callback) {
        this._request('GetLineInLevel', options, callback);
    }

    SelectAudio(options, callback) {
        this._request('SelectAudio', options, callback);
    }
}

export default AudioIn;
