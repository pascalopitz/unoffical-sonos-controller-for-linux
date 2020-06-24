import _ from 'lodash';
import { ipcRenderer } from 'electron';

import SonosService from './SonosService';
import store from '../reducers';

const VOLUME_STEP = 2;

const query = _.debounce((sonos) => {
    SonosService.queryState(sonos);
}, 2000);

const handleMessage = async (source, message) => {
    const state = store.getState();

    const sonos = SonosService._currentDevice;
    const groupRenderingService = sonos.groupRenderingControlService();

    console.log(message, state, sonos);

    switch (message.type) {
        case 'VOLUME_UP': {
            await groupRenderingService.SetRelativeGroupVolume(VOLUME_STEP);
            break;
        }

        case 'VOLUME_DOWN': {
            await groupRenderingService.SetRelativeGroupVolume(
                VOLUME_STEP * -1
            );
            break;
        }

        case 'TOGGLE_MUTE':
            const muted = await groupRenderingService.GetGroupMute();
            await groupRenderingService.SetGroupMute(!muted);
            break;

        case 'PREV':
            await sonos.previous();
            break;

        case 'NEXT':
            await sonos.next();
            break;

        case 'TOGGLE_PLAY':
            await sonos.togglePlayback();
            break;

        default:
            // noop
            break;
    }

    query(sonos);
};

export default {
    mount() {
        ipcRenderer.on('command', handleMessage);
    },
};
