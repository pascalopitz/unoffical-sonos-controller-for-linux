import register from '../helpers/registerComponent';
import model from '../model';

import MuteButton from './MuteButton'; 
import VolumeSlider from './VolumeSlider'; 

class VolumeControls {

	getInitialState () {
		return {
			master: {
				volume: 8,
				muted: false
			},
			players: [{
				name: 'One',
				volume: 8,
				muted: false
			}, {
				name: 'two',
				volume: 6,
				muted: true
			}, {
				name: 'Three',
				volume: 3,
				muted: false
			}]
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

		return (
			<div>
				<MuteButton muted={this.state.master.muted} />
				<VolumeSlider volume={this.state.master.volume} />

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
export default register(VolumeControls);