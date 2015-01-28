import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class PositionInfo {

	render () {
		return (
			<div id="position-info">
				<img className="left" src="images/tc_progress_container_left.png" />
				<img className="right" src="images/tc_progress_container_right.png" />
				<div className="content">
					<img id="repeat" className="playback-mode" src="images/tc_progress_repeat_normal_off.png" />
					<img id="shuffle"  className="playback-mode" src="images/tc_progress_shuffle_normal_off.png" />
					<img id="crossfade"  className="playback-mode" src="images/tc_progress_crossfade_normal_off.png" />
					<span id="countup">0:00</span>
						<div id="position-info-control">
							<div id="position-bar">
								<div id="position-bar-scrubber"></div>
							</div>
						</div>
					<span id="countdown">-0:00</span>
				</div>

			</div>
		);
	}

	_onClick () {
		this.trigger('queuelist:goto', this.props.position);
	}
}

PositionInfo.prototype.displayName = "PositionInfo";
PositionInfo.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
export default React.createClass(PositionInfo.prototype);