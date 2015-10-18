"use strict";

import React from 'react';

import PlayerActions from '../actions/PlayerActions';
import PlayerStore from '../stores/PlayerStore';

class PlayControls extends React.Component {

	constructor(props) {
		super(props);

		let playing = PlayerStore.isPlaying();

		this.state = {
			playing: playing,
		};
	}

	componentDidMount() {
		PlayerStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		let playing = PlayerStore.isPlaying();

		this.setState({
			playing: playing,
		});
	}

	render () {
		let src = this.state.playing ? "svg/pause.svg" : "svg/play.svg";

		return (
			<div id="controls">
				<img id="prev" src="svg/prev.svg" onClick={this._prev.bind(this)} />
				<div id="play-pause" className="play" onClick={this._toggle.bind(this)} >
					<img id="play" src={src} />
				</div>
				<img id="next" src="svg/next.svg" onClick={this._next.bind(this)} />
			</div>
		);
	}

	_toggle () {
		if(this.state.playing) {
			PlayerActions.pause();
		} else {
			PlayerActions.play();
		}
	}

	_prev () {
		PlayerActions.playPrev();
	}

	_next () {
		PlayerActions.playNext();
	}
}

export default PlayControls;