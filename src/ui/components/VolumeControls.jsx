import React from 'react/addons';

import MuteButton from './MuteButton'; 
import VolumeSlider from './VolumeSlider'; 

import PlayerActions from '../actions/PlayerActions';
import VolumeControlStore from '../stores/VolumeControlStore';

class VolumeControls extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			muted: VolumeControlStore.getMuted(),
			volume: VolumeControlStore.getVolume(),
		};
	}

	componentDidMount () {
		VolumeControlStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange () {
		this.setState({
			muted: VolumeControlStore.getMuted(),
			volume: VolumeControlStore.getVolume(),
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

	render () {

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
			<div>
				<MuteButton id="master-mute" muted={this.state.muted} />
				<VolumeSlider id="master-volume" volume={this.state.volume} />

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