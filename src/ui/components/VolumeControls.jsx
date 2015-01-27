import model from '../model';

import MuteButton from './MuteButton'; 
import VolumeSlider from './VolumeSlider'; 

var React = require('react/addons');

class VolumeControls {

	getInitialState () {
		return {
			master: {
				volume: 0,
				muted: false
			},
			players: []
		}
	}

	componentDidMount () {
		var self = this;

		model.observe('volume', function() {
			self.setState({
				master: {
					volume: model.volume
				}
			});
		});
	}

	render () {

		var playerVolumeNodes = this.state.players.map(function (p) {
			return (
				<div>
			<MuteButton muted={p.muted} />
			<VolumeSlider volume={p.volume} />
				</div>
			);
		});		


		/*
 		<img	id="master-mute" class="mute-button" src="svg/mute_off.svg" />
		<div id="master-volume" class="volume-bar" /><img src="images/popover_vol_scrubber_normal.png" /></div>
		<div id="player-volumes-container">
			<div id="player-volumes" class="loading"></div>
		</div>
		*/

		return (
			<div>
				<MuteButton id="master-mute" muted={this.state.master.muted} />
				<VolumeSlider id="master-volume" volume={this.state.master.volume} />

				<div id="player-volumes-container">
					<div id="player-volumes" className="loading">
					{{playerVolumeNodes}}
					</div>
				</div>
			</div>
		);
	}

	_toggleMute () {
		console.log('toggleMute');
	}
}

VolumeControls.prototype.displayName = "VolumeControls";
export default React.createClass(VolumeControls.prototype);