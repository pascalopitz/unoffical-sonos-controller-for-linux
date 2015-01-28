import port from '../port';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class PlayControls {

	render () {
		var src = this.props.model.value.playing ? "svg/pause.svg" : "svg/play.svg";

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
PlayControls.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
PlayControls.prototype.propTypes = {
	model: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(PlayControls.prototype);