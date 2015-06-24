"use strict";

import _ from 'lodash';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

import SonosService  from '../services/SonosService';
import Services from '../sonos/helpers/Services';

import QueueStore from '../stores/QueueStore';

export default {

	flush () {
		let sonos = SonosService._currentDevice;

		sonos.flush(() => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_FLUSH,
			});
			SonosService.queryState();
		});
	},

	gotoPosition (position) {
		let sonos = SonosService._currentDevice;

		sonos.selectQueue(() => {
			sonos.goto(position, () => {
				sonos.play(() => {
					Dispatcher.dispatch({
						actionType: Constants.QUEUE_GOTO,
						position: position,
					});
					SonosService.queryState();
				});
			});
		});
	},

	select (position) {
		Dispatcher.dispatch({
			actionType: Constants.QUEUE_SELECT,
			position: position,
		});
	},

	deselect (position) {
		Dispatcher.dispatch({
			actionType: Constants.QUEUE_DESELECT,
			position: position,
		});
	},

	_getSeries() {
		let tracks = QueueStore.getTracks();

		let series = [];

		let prevSelected = false;
		let newRequired = true;

		tracks.forEach((track, i) => {
			let isSelected =track.selected;

			if(isSelected) {

				if(newRequired) {
					series.push([]);
					newRequired = false;
				}

				series[series.length - 1].push(i + 1);
			}

			if(!isSelected && prevSelected) {
				newRequired = true;
			}

			prevSelected = isSelected;
		});

		return series;
	},

	removeSelected () {
		let sonos = SonosService._currentDevice;
		let avTransport = new Services.AVTransport(sonos.host, sonos.port);

		let promises = [];
		let removed = 0;

		this._getSeries().forEach((arr) => {

			let StartingIndex = arr[0] - removed;
			let NumberOfTracks = arr.length;
			removed = removed + NumberOfTracks;

			promises.push(new Promise((resolve, reject) => {
				let params = {
					InstanceID: 0,
					UpdateID: 0,
					StartingIndex: StartingIndex,
					NumberOfTracks: NumberOfTracks,
				};
				avTransport.RemoveTrackRangeFromQueue(params, (err) => {
					if(err) {
						reject();
					} else {
						resolve();
					}
				});
			}));
		});

		Promise.all(promises).then(() => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_REMOVE,
			});
			QueueStore.clearSelected();
			SonosService.queryState();
		});
	},

	removeTrack (position) {
		let sonos = SonosService._currentDevice;

		let params = {
			InstanceID: 0,
			UpdateID: 0,
			StartingIndex: position,
			NumberOfTracks: 1,
		};

		var avTransport = new Services.AVTransport(sonos.host, sonos.port);

		avTransport.RemoveTrackRangeFromQueue(params, () => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_REMOVE,
			});
			SonosService.queryState();
		});
	},

	changePosition(position, newPosition) {
		let sonos = SonosService._currentDevice;

		let params = {
			InstanceID: 0,
			StartingIndex: position,
			InsertBefore: newPosition,
			NumberOfTracks: 1,
			UpdateID: QueueStore.getUpdateID(),
		};

		var avTransport = new Services.AVTransport(sonos.host, sonos.port);

		avTransport.ReorderTracksInQueue(params, () => {
			Dispatcher.dispatch({
				actionType: Constants.QUEUE_REORDER,
				position: position,
				newPosition: newPosition,
			});
			SonosService.queryState();
		});
	}
};