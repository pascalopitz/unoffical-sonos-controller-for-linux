import model from '../model';

const width = 180;

var React = require('react/addons');

class VolumeSlider {

	render () {
		var id = this.props.id || '';

		var margin = width / 100 * this.props.volume;

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
export default React.createClass(VolumeSlider.prototype);