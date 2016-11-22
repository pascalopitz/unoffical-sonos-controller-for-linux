import _ from 'lodash';

import React from 'react';

const WIDTH = 180;
const ADJUST = 21;

class VolumeSlider extends React.Component {

	constructor () {
		super();
		this.state = { dragging: false };
	}


	_onStart (e) {
		this.setState({
			dragging: true,
			volume: Number(e.target.value),
		});

		this.props.startHandler();
	}

	_onStop (e) {
		this.setState({
			dragging: false,
			volume: null,
		});

		this.props.stopHandler();
	}

	_onChange(e) {
		let volume = e.target.value

		this.setState({
			dragging: true,
			volume: Number(e.target.value),
		});

		this.props.dragHandler(volume);
	}

	render () {
		let volume = (this.state.dragging) ? this.state.volume : Number(this.props.volume);

		return (
			<div className="volume-bar">
				<input type="range" min="0" max="100" value={Number(volume)}
					onMouseDown={this._onStart.bind(this)}
					onMouseUp={this._onStop.bind(this)}
					onChange={_.throttle(this._onChange.bind(this), 100)}
				 />
			</div>
		);
	}


}

export default VolumeSlider;
