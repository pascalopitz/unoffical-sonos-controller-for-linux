const width = 180;

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class VolumeSlider {

	render () {
		var id = this.props.id || '';

		var margin = width / 100 * this.props.volume.value;

		var styles = {
			marginLeft: margin + "px",			
		};

		return (
			<div id={this.props.id} className="volume-bar">
				<img style={styles}  src="images/popover_vol_scrubber_normal.png" />
			</div>
		);
	}
}

VolumeSlider.prototype.displayName = "VolumeSlider";
VolumeSlider.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
VolumeSlider.prototype.propTypes = {
	volume: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(VolumeSlider.prototype);