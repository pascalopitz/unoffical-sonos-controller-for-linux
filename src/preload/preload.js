import { contextBridge, shell } from 'electron';
import getServiceLogoUrl from '../common/helpers/getServiceLogoUrl';
import { isStreamUrl } from '../common/helpers/sonos';
import { IP_ADDRESS, LOCAL_PORT } from '../common/ip';
import store from '../common/reducers';
import * as BrowserListActions from '../common/reduxActions/BrowserListActions';
import * as CurrentTrackActions from '../common/reduxActions/CurrentTrackActions';
import * as EqActions from '../common/reduxActions/EqActions';
import * as GroupManagementActions from '../common/reduxActions/GroupManagementActions';
import * as MusicServicesActions from '../common/reduxActions/MusicServicesActions';
import * as PlayerActions from '../common/reduxActions/PlayerActions';
import * as PlaylistActions from '../common/reduxActions/PlaylistActions';
import * as QueueActions from '../common/reduxActions/QueueActions';
import * as StoreActions from '../common/reduxActions/StoreActions';
import * as VolumeControlActions from '../common/reduxActions/VolumeControlActions';
import * as ZoneGroupActions from '../common/reduxActions/ZoneGroupActions';
import * as BrowserListSelectors from '../common/selectors/BrowserListSelectors';
import * as VolumeControlSelectors from '../common/selectors/VolumeControlSelectors';
import IpcService from '../common/services/IpcService';
import MprisService from '../common/services/MprisService';
import { getByServiceId } from '../common/services/MusicServiceClient';
import SonosService from '../common/services/SonosService';



contextBridge.exposeInMainWorld('ipHelper', { IP_ADDRESS, LOCAL_PORT });
contextBridge.exposeInMainWorld('store', store);

// Actions
contextBridge.exposeInMainWorld('BrowserListActions', BrowserListActions);
contextBridge.exposeInMainWorld('CurrentTrackActions', CurrentTrackActions);
contextBridge.exposeInMainWorld('EqActions', EqActions);
contextBridge.exposeInMainWorld(
    'GroupManagementActions',
    GroupManagementActions
);
contextBridge.exposeInMainWorld('MusicServicesActions', MusicServicesActions);
contextBridge.exposeInMainWorld('PlayerActions', PlayerActions);
contextBridge.exposeInMainWorld('PlaylistActions', PlaylistActions);
contextBridge.exposeInMainWorld('QueueActions', QueueActions);
contextBridge.exposeInMainWorld('VolumeControlActions', VolumeControlActions);
contextBridge.exposeInMainWorld('ZoneGroupActions', ZoneGroupActions);

// Selectors
contextBridge.exposeInMainWorld('BrowserListSelectors', BrowserListSelectors);
contextBridge.exposeInMainWorld(
    'VolumeControlSelectors',
    VolumeControlSelectors
);

contextBridge.exposeInMainWorld('getServiceLogoUrl', getServiceLogoUrl);
contextBridge.exposeInMainWorld('isStreamUrl', isStreamUrl);

contextBridge.exposeInMainWorld('getCurrentDevice', () => {
    const { host, port } = SonosService._currentDevice || {};
    return { host, port };
});
contextBridge.exposeInMainWorld('getByServiceId', getByServiceId);

contextBridge.exposeInMainWorld('openExternal', shell.openExternal);

contextBridge.exposeInMainWorld('initialise', async () => {
    await StoreActions.reset();
    SonosService.mount();
    IpcService.mount();
    MprisService.mount();    
});
