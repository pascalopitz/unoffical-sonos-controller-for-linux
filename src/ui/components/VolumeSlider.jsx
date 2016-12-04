import _ from 'lodash';

import { h, Component } from 'preact'; //eslint-disable-line

const WIDTH = 180;
const ADJUST = 21;

class VolumeSlider extends Component {

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
					onmousedown={this._onStart.bind(this)}
					onmouseup={this._onStop.bind(this)}
					oninput={_.throttle(this._onChange.bind(this), 100)}
				 />
			</div>
		);
	}


}

export default VolumeSlider;
