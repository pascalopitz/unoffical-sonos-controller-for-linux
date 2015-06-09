import React from 'react/addons';

import MuteButton from './MuteButton'; 
import VolumeSlider from './VolumeSlider'; 

import PlayerActions from '../actions/PlayerActions';
import PlayerStore from '../stores/PlayerStore';

class VolumeControls extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			muted: PlayerStore.getMuted(),
			volume: PlayerStore.getVolume(),
		};
	}

	componentDidMount() {
		PlayerStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		this.setState({
			muted: PlayerStore.getMuted(),
			volume: PlayerStore.getVolume(),
		});
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