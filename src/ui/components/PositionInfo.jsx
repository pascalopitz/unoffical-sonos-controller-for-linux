import moment from 'moment';
import React from 'react/addons';

import PlayerActions from '../actions/PlayerActions';
import PlayerStore from '../stores/PlayerStore';

class PositionInfo extends React.Component {

	constructor () {
		super();
		this.state = {
			info: null,
		};
	}

	componentDidMount() {
		PlayerStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		let info = PlayerStore.getPositionInfo();

		this.setState({
			info: info,
		});
	}

	render () {

		var info = this.state.info;
		var percent = 0;
		var from = '00:00';
		var to = '-0:00';

		if(info) {
			var r = info.RelTime.split(':');
			var d = info.TrackDuration.split(':');

			var start = moment().startOf('day');
			var now = moment().startOf('day').add(r[0], 'h').add(r[1], 'm').add(r[2], 's');
			var end = moment().startOf('day').add(d[0], 'h').add(d[1], 'm').add(d[2], 's');

			var from = now.format('mm:ss');
			var to = '-' + end.clone().subtract(now).format('mm:ss');

			percent = 100/ (end - start) * (now - start);
		}

		var styles = {
			left: String(Math.round(percent)) + '%'
		};

		return (
			<div id="position-info">
				<img className="left" src="images/tc_progress_container_left.png" />
				<img className="right" src="images/tc_progress_container_right.png" />
				<div className="content">
					<img id="repeat" className="playback-mode" src="images/tc_progress_repeat_normal_off.png" />
					<img id="shuffle"  className="playback-mode" src="images/tc_progress_shuffle_normal_off.png" />
					<img id="crossfade"  className="playback-mode" src="images/tc_progress_crossfade_normal_off.png" />
					<span id="countup">{from}</span>
						<div id="position-info-control">
							<div id="position-bar">
								<div id="position-bar-scrubber" style={styles}></div>
							</div>
						</div>
					<span id="countdown">{to}</span>
				</div>

			</div>
		);
	}

	_onClick () {
		// PlayerActions.
		// this.trigger('queuelist:goto', this.props.position);
	}
}

export default PositionInfo;
