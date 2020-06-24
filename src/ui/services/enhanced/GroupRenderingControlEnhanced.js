import { Services } from 'sonos';

export default class GroupRenderingControlEnhanced extends Services.GroupRenderingControl {
    GetGroupMute = async () => {
        return this._request('GetGroupMute', { InstanceID: 0 }).then((r) =>
            Boolean(Number(r.CurrentMute))
        );
    };

    SetGroupMute = async (DesiredMute) => {
        return this._request('SetGroupMute', { InstanceID: 0, DesiredMute });
    };

    GetGroupVolume = async () => {
        return this._request('GetGroupVolume', { InstanceID: 0 }).then((r) =>
            Number(r.CurrentVolume)
        );
    };

    SetGroupVolume = async (DesiredVolume) => {
        return this._request('SetGroupVolume', {
            InstanceID: 0,
            DesiredVolume,
        });
    };

    SetRelativeGroupVolume = async (Adjustment) => {
        return this._request('SetRelativeGroupVolume', {
            InstanceID: 0,
            Adjustment,
        }).then((r) => Number(r.NewVolume));
    };

    SnapshotGroupVolume = async () => {
        return this._request('SnapshotGroupVolume', {
            InstanceID: 0,
        });
    };
}
