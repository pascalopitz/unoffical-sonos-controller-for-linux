import _ from 'lodash';

import React from 'react';
import Draggable from 'react-draggable2';

const WIDTH = 180;
const ADJUST = 21;

class VolumeSlider extends React.Component {

	constructor () {
		super();
		this.state = { dragging: false };
	}

	render () {
		let left = (this.state.dragging) ?  (this.state.left) : ((WIDTH - ADJUST) / 100 * this.props.volume);
		let pos = { x: left, y: 0 };

		return (
			<div className="volume-bar">
				<Draggable
					axis="x"
					handle="img"
					onStop={this._onStop.bind(this)}
					onDrag={this._onDrag.bind(this)}
					onStart={this._onStart.bind(this)}
					start={pos}
					bound="all box">
					<img
						src="images/popover_vol_scrubber_normal.png" />
				</Draggable>
			</div>
		);
	}

	_onStart (e, params) {
		this.setState({
			dragging: true,
			left: params.position.left,
		});

		this.props.startHandler();
	}

	_onDrag (e, params) {
		let left = params.position.left;
		if(left < 0) {
			left = 0;
		}

		this.setState({
			dragging: true,
			left: left,
		});

		let volume = Math.ceil(left / (WIDTH - ADJUST) * 100);
		let func = _.throttle(() => {
			this.props.dragHandler(volume);
		}, 100);
		func();
	}

	_onStop (e, params) {
		this.setState({
			dragging: false,
			left: null,
		});

		this.props.stopHandler();
	}
}

export default VolumeSlider;
