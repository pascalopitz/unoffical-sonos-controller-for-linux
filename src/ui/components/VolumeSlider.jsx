const width = 180;

import React from 'react/addons';
import Draggable from 'react-draggable2';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

class VolumeSlider extends ImmutableMixin {

	constructor () {
		super();
		this.state = { dragging: false };
	}

	render () {
		var id = this.props.id || '';

		var left = width / 100 * this.props.volume.value;

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
		this.trigger('volume:set', {
			channel: this.props.id,
			volume: Math.round(params.position.left * 100 / width)
		});
	}
}

VolumeSlider.propTypes = {
	volume: React.PropTypes.instanceOf(Cursor).isRequired
};
export default VolumeSlider;
