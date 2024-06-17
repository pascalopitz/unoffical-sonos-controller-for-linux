import debounce from 'lodash/debounce';
import { ipcRenderer } from 'electron';

import SonosEnhanced from './enhanced/SonosEnhanced';
import SonosService from './SonosService';

import {
    LIBRARY_INDEX,
    VOLUME_UP,
    VOLUME_DOWN,
    TOGGLE_MUTE,
    PREV,
    NEXT,
    TOGGLE_PLAY,
    ADD_PLAYER_IP,
    ADD_PLAY_URL,
} from '../../common/ipcCommands';

const VOLUME_STEP = 2;

const query = debounce((sonos) => {
    SonosService.queryState(sonos);
}, 2000);

const handleMessage = async (source, message) => {
    const sonos = SonosService._currentDevice;

    switch (message.type) {
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
                VOLUME_STEP * -1,
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

        case ADD_PLAY_URL: {
            await sonos.play(message.url);
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
