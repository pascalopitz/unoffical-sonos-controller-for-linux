import _ from 'lodash';

import e from './helpers/events';
import Search from './sonos/Search';
import Listener from './sonos/events/listener';

import xml2json from 'jquery-xml2json';

const reg = /^http:\/\/([\d\.]+)/;

import QueueActions from './actions/QueueActions';
import ZoneGroupActions from './actions/ZoneGroupActions';

import Dispatcher from './dispatcher/AppDispatcher';

var firstSonos;

var deviceSearches = {};
var listeners = {};
var serviceEventHandlers = {};

var queryInterval = null;
var currentSonos = null;
var currentSubscriptions = [];

var cursor;

class SonosCoordinator {

  constructor () {
    // e.on('application:mount', this.handleAppMount.bind(this));
    // e.on('zonegroup:select', this.selectCurrentZone.bind(this));
    // e.on('playstate:toggle', this.toggelPlaystate.bind(this));
    // e.on('playstate:prev', this.playPrev.bind(this));
    // e.on('playstate:next', this.playNext.bind(this));
    // e.on('queuelist:goto', this.queuelistGoto.bind(this));
    // e.on('browser:action', this.browserAction.bind(this));
    // e.on('browser:back', this.browserBack.bind(this));
    // e.on('browser:render', this.browserRender.bind(this));
    // e.on('browser:more', this.browserAddToList.bind(this));
    // e.on('volume:togglemute', this.toggleMute.bind(this));
    // e.on('volume:set', this.volumeSet.bind(this));
  }


  queryState (sonos) {
    sonos.getPositionInfo((err, info) => {
      cursor.refine('positionInfo').set(info);
    });

    sonos.getVolume((err, vol) => {
      cursor.refine('volumeControls', 'master', 'volume').set(vol);
    });

    sonos.getGroupMuted((err, muted) => {
      cursor.refine('volumeControls', 'master', 'mute').set(muted);
    });

    sonos.currentTrack((err, track) => {
      cursor.merge({
        currentTrack: track
      });
    });

    sonos.getCurrentState((err, state) => {
      this.setCurrentState(state);
    });

    sonos.getMusicLibrary('queue', {}, (err, result) => {
      QueueActions.setTracks(result.tracks);
    });
  }



  toggleMute (id) {
    let muted = this.cursor.refine('volumeControls', 'master', 'mute').value;

    currentSonos.setGroupMuted(!muted, () => {

    });
  }


  volumeSet (params) {
    console.log('volumeSet', params.volume);
  }

  browserRender (state) {

    window.setTimeout(() => {
      if(!this.cursor) {
        return;
      }

      var history = this.cursor.refine('browserStateHistory').value;

      if(history[history.length - 1] === state) {
        return;
      }

      history.push(state);
      this.cursor.refine('browserStateHistory').set(history);
    }, 100);
  }

  browserBack () {
    var history = this.cursor.refine('browserStateHistory').value;

    if(history.length <= 1) {
      return;
    }

    history.pop();
    var state = history.pop();

    this.cursor.set({
      browserState: state,
      browserStateHistory: history
    });
  }

  browserAddToList () {
    var model = this.cursor.refine('browserStateHistory');
    var state = _.last(model.value);

    currentSonos.getMusicLibrary(state.searchType, {
      start: state.items.length
    }, (err, result) => {
      state.items = state.items.concat(result.items);
      this.cursor.set({ browserState : state });
    });
  }

}

var sonosCoordinator = new SonosCoordinator();

export default sonosCoordinator;
