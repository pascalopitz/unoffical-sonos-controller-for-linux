import { Services } from 'sonos';

export default class RenderingControlEnhanced extends Services.RenderingControl {
    GetLoudness = async (Channel = 'Master') => {
        return this._request('GetLoudness', {
            InstanceID: 0,
            Channel,
        }).then((r) => parseInt(r.CurrentLoudness));
    };

    SetLoudness = async (DesiredLoudness, Channel = 'Master') => {
        return this._request('SetLoudness', {
            InstanceID: 0,
            Channel,
            DesiredLoudness,
        });
    };

    GetBass = async () => {
        return this._request('GetBass', { InstanceID: 0 }).then((r) =>
            parseInt(r.CurrentBass)
        );
    };

    SetBass = async (bass) => {
        return this._request('SetBass', {
            InstanceID: 0,
            DesiredBass: bass,
        });
    };

    GetTreble = async () => {
        return this._request('GetTreble', { InstanceID: 0 }).then((r) =>
            parseInt(r.CurrentTreble)
        );
    };

    SetTreble = async (treble) => {
        return this._request('SetTreble', {
            InstanceID: 0,
            DesiredTreble: treble,
        });
    };
}
