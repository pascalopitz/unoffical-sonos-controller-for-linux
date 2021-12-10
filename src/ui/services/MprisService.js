import Player from 'mpris-service';
import * as crypto from 'crypto';

import { play, pause, playNext, playPrev } from '../reduxActions/PlayerActions';
import store from '../reducers';
import { disableNextButton, getPlaying, isStreaming } from '../selectors/PlayerSelectors';

const player = Player({
    name: 'sonos',
    identity: 'Sonos',
    supportedInterfaces: ['player'],
    canRaise: false,
    canQuit: false,
    canSetFullscreen: false,
    canSeek: false,
});

let lastTrackState = {};
let lastPlayState = Player.PLAYBACK_STATUS_STOPPED;

export default {
    mount() {
        player.on('play', play);
        player.on('pause', pause);
        player.on('playpause', togglePlayPause);
        player.on('stop', pause);
        player.on('next', playNext);
        player.on('previous', playPrev);

        store.subscribe(handleStateChange);
    },
};

function togglePlayPause() {
    if (getPlaying(store.getState())) {
        pause();
        return;
    }

    play();
}

function handleStateChange() {
    const state = store.getState();
    const currentDevice = state.sonosService.currentHost;
    if (!currentDevice) {
        return;
    }

    updatePlayerCapabilities(state);

    const currentTrack = state.sonosService.currentTracks[currentDevice];
    updateTrack(currentTrack);

    const currentPlayState = state.sonosService.playStates[currentDevice];
    updatePlayState(currentPlayState);
}

function updateTrack(track) {
    if (!track || shallowEqual(track, lastTrackState)) {
        return;
    }

    lastTrackState = track;
    player.metadata = {
        'mpris:trackid': player.objectPath(
            `track/${track.id != null ? track.id : uniqueTrackId(track)}`
        ),
        'mpris:length': track.duration * 1000,
        'mpris:artUrl': track.albumArtURL,
        'xesam:title': track.title,
        'xesam:album': track.album,
        'xesam:artist': [track.artist],
    };
}

function updatePlayState(state) {
    if (!state || shallowEqual(state, lastPlayState)) {
        return;
    }

    lastPlayState = state;
    switch (state) {
        case 'playing':
            player.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
            break;
        case 'paused':
            player.playbackStatus = Player.PLAYBACK_STATUS_PAUSED;
            break;
        default:
            player.playbackStatus = Player.PLAYBACK_STATUS_STOPPED;
            break;
    }
}

function updatePlayerCapabilities(state) {
    player.canGoNext = !disableNextButton(state);
    player.canGoPrevious = !isStreaming(state);
    player.canPlay = lastTrackState.hasOwnProperty('title');
}

function shallowEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
}

function uniqueTrackId(track) {
    return crypto.createHash('sha1').update(track.toString()).digest('hex');
}
