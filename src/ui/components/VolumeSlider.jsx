import register from '../helpers/registerComponent';
import model from '../model';

const width = 180;

class VolumeSlider {

	render () {

		var margin = width / 100 * this.props.volume;

		var styles = {
			"margin-left": margin + "px",			
		};

		return (
			<div className="volume-bar">
				<img style={styles}  src="images/popover_vol_scrubber_normal.png" />
			</div>
		);
	}
}

VolumeSlider.prototype.displayName = "VolumeSlider";
export default register(VolumeSlider);