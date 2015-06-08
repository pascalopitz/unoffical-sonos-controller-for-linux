import React from 'react/addons';
import Draggable from 'react-draggable2';

const WIDTH = 180;

class VolumeSlider extends React.Component {

	constructor () {
		super();
		this.state = { dragging: false };
	}

	render () {
		var id = this.props.id || '';

		var left = WIDTH / 100 * this.props.volume;

		var pos = { x: left, y: 0 };

		return (
			<div
				id={this.props.id}
				className="volume-bar">
				<Draggable
					axis="x"
					handle="img"
					onStop={this._onStop.bind(this)}
					start={pos}
					bound="all box">
					<img
						src="images/popover_vol_scrubber_normal.png" />
				</Draggable>
			</div>
		);
	}

	_onStop (e, params)  {
		// this.trigger('volume:set', {
		// 	channel: this.props.id,
		// 	volume: Math.round(params.position.left * 100 / WIDTH)
		// });
	}
}

export default VolumeSlider;
