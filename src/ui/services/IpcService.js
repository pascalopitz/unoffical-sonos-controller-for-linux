import _ from 'lodash';
import { ipcRenderer } from 'electron';

import SonosEnhanced from './enhanced/SonosEnhanced';
import SonosService from './SonosService';
import store from '../reducers';
import { localFilesUpdate } from '../reduxActions/SonosServiceActions';
import { home } from '../reduxActions/BrowserListActions';

import {
    LOCAL_MUSIC_SET_FOLDER,
    LOCAL_MUSIC_TOGGLE,
    LIBRARY_INDEX,
    VOLUME_UP,
    VOLUME_DOWN,
    TOGGLE_MUTE,
    PREV,
    NEXT,
    TOGGLE_PLAY,
    ADD_PLAYER_IP,
} from '../../common/ipcCommands';

const VOLUME_STEP = 2;

const query = _.debounce((sonos) => {
    SonosService.queryState(sonos);
}, 2000);

const handleMessage = async (source, message) => {
    const sonos = SonosService._currentDevice;

    switch (message.type) {
        case LOCAL_MUSIC_SET_FOLDER: {
            window.localStorage.localMusicFolder = message.path;
            store.dispatch(localFilesUpdate());
            store.dispatch(home());
            break;
        }

        case LOCAL_MUSIC_TOGGLE: {
            const enabled = JSON.parse(
                window.localStorage.localMusicEnabled || 'false'
            );
            window.localStorage.localMusicEnabled = !enabled;
            store.dispatch(localFilesUpdate());
            store.dispatch(home());
            break;
        }

        case LIBRARY_INDEX: {
            const contentDirectoryService = sonos.contentDirectoryService();
            await contentDirectoryService.RefreshShareIndex();
            break;
        }

        case VOLUME_UP: {
            const groupRenderingService = sonos.groupRenderingControlService();
            await groupRenderingService.SetRelativeGroupVolume(VOLUME_STEP);
            query(sonos);
            break;
        }

        case VOLUME_DOWN: {
            const groupRenderingService = sonos.groupRenderingControlService();
            await groupRenderingService.SetRelativeGroupVolume(
                VOLUME_STEP * -1
            );
            query(sonos);
            break;
        }

        case TOGGLE_MUTE:
            const groupRenderingService = sonos.groupRenderingControlService();
            const muted = await groupRenderingService.GetGroupMute();
            await groupRenderingService.SetGroupMute(!muted);
            query(sonos);
            break;

        case PREV:
            await sonos.previous();
            query(sonos);
            break;

        case NEXT:
            await sonos.next();
            query(sonos);
            break;

        case TOGGLE_PLAY:
            await sonos.togglePlayback();
            query(sonos);
            break;

        case ADD_PLAYER_IP: {
            const device = new SonosEnhanced(message.ip);
            await SonosService.connectDevice(device);
            query(sonos);
            break;
        }

        default:
            // noop
            break;
    }
};

export default {
    mount() {
        ipcRenderer.on('command', handleMessage);
    },
};
