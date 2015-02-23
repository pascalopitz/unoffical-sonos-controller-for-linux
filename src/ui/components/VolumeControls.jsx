import MuteButton from './MuteButton'; 
import VolumeSlider from './VolumeSlider'; 

import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

class VolumeControls extends ImmutableMixin {

	render () {

		var model = this.props.model;
		var playerVolumeNodes;
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

		var muted = model.refine('master', 'muted');
		var volume = model.refine('master', 'volume');

		return (
			<div>
				<MuteButton id="master-mute" muted={muted} />
				<VolumeSlider id="master-volume" volume={volume} />

				<div id="player-volumes-container">
					<div id="player-volumes" className="loading">
					{{playerVolumeNodes}}
					</div>
				</div>
			</div>
		);
	}
}

VolumeControls.propTypes = {
	model: React.PropTypes.instanceOf(Cursor).isRequired
};
export default VolumeControls;