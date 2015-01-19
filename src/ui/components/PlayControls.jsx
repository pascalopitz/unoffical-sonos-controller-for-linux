import register from '../helpers/registerComponent';
import model from '../model';

import port from '../port';

class PlayControls {

	getInitialState () {
		return {
			playing: false
		};
	}

	componentDidMount () {
		var self = this;

		model.observe('currentState', function() {
			self.setState({
				playing: model.currentState === 'playing'
			});
		});
	}

	render () {
		var src = this.state.playing ? "svg/pause.svg" : "svg/play.svg";

		return (
			<div id="controls">
				<img id="prev" src="svg/prev.svg" onClick={this._prev} />
				<div id="play-pause" className="play" onClick={this._toggle} >
					<img id="play" src={src} />
				</div>
				<img id="next" src="svg/next.svg" onClick={this._next} />

			</div>

		);
	}

	_toggle () {
		var msg = model.currentState === 'playing' ? 'pause' : 'play';

		port.postMessage({
			type: msg,
			host: model.coordinator.host
		});
	}

	_prev () {
		port.postMessage({
			type: 'prev',
			host: model.coordinator.host
		});
	}

	_next () {
		port.postMessage({
			type: 'next',
			host: model.coordinator.host
		});
	}
}

PlayControls.prototype.displayName = "PlayControls";
export default register(PlayControls);