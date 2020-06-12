import { Services } from 'sonos';

export default class DevicePropertiesEnhanced extends Services.DeviceProperties {
    EnterConfigMode = async (Mode = 'button-notify', Options = '') => {
        return this._request('EnterConfigMode', {
            Mode,
            Options,
        });
    };

    ExitConfigMode = async (Options = '') => {
        return this._request('ExitConfigMode', {
            Options,
        });
    };

    GetButtonState = async () => {
        return this._request('GetButtonState', {}).then((r) => r.State);
    };

    AddBondedZones = async (ChannelMapSet = '') => {
        return this._request('AddBondedZones', {
            ChannelMapSet,
        });
    };

    RemoveBondedZones = async (ChannelMapSet = '', KeepGrouped = 0) => {
        return this._request('RemoveBondedZones', {
            ChannelMapSet,
            KeepGrouped,
        });
    };

    SetZoneAttributes = async (
        DesiredZoneName = '',
        DesiredIcon = '',
        DesiredConfiguration = ''
    ) => {
        return this._request('SetZoneAttributes', {
            DesiredZoneName,
            DesiredIcon,
            DesiredConfiguration,
        });
    };
}
