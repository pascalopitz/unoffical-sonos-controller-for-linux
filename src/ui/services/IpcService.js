import _ from 'lodash';
import { ipcRenderer } from 'electron';

import SonosService from './SonosService';

const VOLUME_STEP = 2;

const query = _.debounce((sonos) => {
    SonosService.queryState(sonos);
}, 2000);

const handleMessage = async (source, message) => {
    const sonos = SonosService._currentDevice;

    switch (message.type) {
        case 'LIBRARY_INDEX': {
            const contentDirectoryService = sonos.contentDirectoryService();
            await contentDirectoryService.RefreshShareIndex();
            break;
        }

        case 'VOLUME_UP': {
            const groupRenderingService = sonos.groupRenderingControlService();
            await groupRenderingService.SetRelativeGroupVolume(VOLUME_STEP);
            query(sonos);
            break;
        }

        case 'VOLUME_DOWN': {
            const groupRenderingService = sonos.groupRenderingControlService();
            await groupRenderingService.SetRelativeGroupVolume(
                VOLUME_STEP * -1
            );
            query(sonos);
            break;
        }

        case 'TOGGLE_MUTE':
            const groupRenderingService = sonos.groupRenderingControlService();
            const muted = await groupRenderingService.GetGroupMute();
            await groupRenderingService.SetGroupMute(!muted);
            query(sonos);
            break;

        case 'PREV':
            await sonos.previous();
            query(sonos);
            break;

        case 'NEXT':
            await sonos.next();
            query(sonos);
            break;

        case 'TOGGLE_PLAY':
            await sonos.togglePlayback();
            query(sonos);
            break;

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
