import { Services } from 'sonos';

export default class RenderingControlEnhanced extends Services.RenderingControl {
    /** TODO: remove when my mistake in node-sonos pull request is fixed */
    SetBass = async (bass) => {
        return this._request('SetBass', {
            InstanceID: 0,
            DesiredBass: bass,
        });
    };

    /** TODO: remove when my mistake in node-sonos pull request is fixed */
    SetTreble = async (treble) => {
        return this._request('SetTreble', {
            InstanceID: 0,
            DesiredTreble: treble,
        });
    };
}
