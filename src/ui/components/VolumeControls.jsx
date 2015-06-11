import _ from 'lodash';
import React from 'react/addons';

import MuteButton from './MuteButton'; 
import VolumeSlider from './VolumeSlider'; 

import VolumeControlActions from '../actions/VolumeControlActions';
import VolumeControlStore from '../stores/VolumeControlStore';

class VolumeControls extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			players: VolumeControlStore.getPlayers(),
		};
	}

	componentDidMount () {
		VolumeControlStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange () {
		this.setState({
			players: VolumeControlStore.getPlayers(),
		});
	}

	_onGroupVolumeChange () {

/**
	 * Set GroupVolume
	 * @param	{String}	volume 0..100
	 * @param	{Function} callback (err, data)
	 * @return {[type]}
	 */
	// setGroupVolume (muted, callback) {
		/*
		var actions = [];
		var count = 0;
		var groupVolume = this.groupState.volume;

		var deltaVolume;
		// If prefixed with + or -
		if (/^[+-]/.test(volumeLevel)) {
			deltaVolume = parseInt(volumeLevel);
			volumeLevel = groupVolume + parseInt(volumeLevel);
		} else {
			volumeLevel = parseInt(volumeLevel);
			deltaVolume = volumeLevel - groupVolume;
		}

		var newVolume;
		for (var uuid in this.discovery.players) {
			var player = this.discovery.players[uuid];
			if (player.coordinator.uuid != this.uuid) continue;
			// part of this group

			if (volumeLevel < 1)
				newVolume = 0;
			else if (deltaVolume > 0)
				newVolume = player.state.volume + deltaVolume;
			else {
				var factor = player.state.volume / groupVolume;
				var newVolume = Math.ceil(factor * volumeLevel);
			}

			// set this here to recalculate group volume instantly
			player.state.volume = newVolume;

			actions.push(function (player, volume) {
				return function (callback) {
					player.setVolume(volume, function (success) {
						callback(success ? null : "error", volume);
					});
				}
			}(player, newVolume));
		}

		this.calculateGroupVolume();

		async.parallel(actions, function(status) {
			// recalculate group volume when finished
		});
		*/
	// }
		
	}

	_toggleGoupMute (e) {
		let muted = this._calculateGroupMuted();

		Object.keys(this.state.players).forEach((host) => {
			VolumeControlActions.setPlayerMuted(host, !muted);
		});
	}

	_changeGroupVolume (volume) {
		let keys = Object.keys(this.state.players);

		if(keys.length === 1) {
			_.forEach(keys, (host) => {
				VolumeControlActions.setPlayerVolume(host, volume);
			});
		} else {

		}
	}

	_calculateGroupMuted () {
		return _.where(this.state.players, { muted: false }).length === 0;
	}

	_calculateGroupVolume () {
		let keys = Object.keys(this.state.players);

		if(!keys.length) {
			return 0;
		}

		return Math.floor(_.sum(_.pluck(this.state.players, 'volume')) / keys.length);
	}

	render () {

		let groupMuted = false;
		let groupVolume = 0;

		let keys = Object.keys(this.state.players);

		if(keys.length === 1) {
			groupMuted = this.state.players[keys[0]].muted;
			groupVolume = this.state.players[keys[0]].volume;
		} else {
			groupMuted = this._calculateGroupMuted();
			groupVolume = this._calculateGroupVolume();
		}





		// var model;// = this.props.model;
		// var playerVolumeNodes;
		// var player = volume.refine('players');


		// var playerVolumeNodes = .players.map(function (p) {
		// 	return (
		// 		<div>
		// 	<MuteButton muted={p.muted} />
		// 	<VolumeSlider volume={p.volume} />
		// 		</div>
		// 	);
		// });		


		/*
 		<img	id="master-mute" class="mute-button" src="svg/mute_off.svg" />
		<div id="master-volume" class="volume-bar" /><img src="images/popover_vol_scrubber_normal.png" /></div>
		<div id="player-volumes-container">
			<div id="player-volumes" class="loading"></div>
		</div>
		*/

		return (
			<div id="master-volume">
				<MuteButton muted={groupMuted} 
							clickHandler={this._toggleGoupMute.bind(this)} />

				<VolumeSlider volume={groupVolume}
							  dragHandler={this._changeGroupVolume.bind(this)} />

				{/*
				<div id="player-volumes-container">
					<div id="player-volumes" className="loading">
					{{playerVolumeNodes}}
					</div>
				</div>
				*/}
			</div>
		);
	}
}

export default VolumeControls;