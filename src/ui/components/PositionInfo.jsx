import moment from 'moment';
import React from 'react/addons';

import PlayerActions from '../actions/PlayerActions';
import PlayerStore from '../stores/PlayerStore';

class PositionInfo extends React.Component {

	constructor () {
		super();
		this.state = {
			isPlaying: false,
			info: null,
			offset: 0,
		};

		this._interval = null;
	}

	componentDidMount () {
		PlayerStore.addChangeListener(this._onChange.bind(this));
	}

	componentWillUnmount () {
		this.cleanInterval();
	}

	startInterval ()  {
		this._interval = window.setInterval(this._onInterval.bind(this), 1000);
	}

	cleanInterval ()  {
		if(this._interval) {
			window.clearInterval(this._interval);
		}
		this._interval = null;
	}

	_onChange () {
		let info = PlayerStore.getPositionInfo();
		let isPlaying = PlayerStore.isPlaying()
		let offset = this.state.offset;

		this.setState({
			isPlaying: isPlaying,
		});

		if(info !== this.state.info) {
			this.cleanInterval()

			this.setState({
				info: info,
				offset: 0,
			});
	
			this.startInterval();
		}
	}

	_onInterval () {
		if(this.state.isPlaying) {
			this.setState({
				offset: this.state.offset + 1
			});
		}
	}

	_onClick (e) {

		let info = this.state.info;

		if(!info || !info.TrackDuration) {
			return;
		}

		let element = e.target;
		let rect = element.getBoundingClientRect();
		let left = e.screenX - Math.floor(rect.left);

		let d = info.TrackDuration.split(':');
		let totalSeconds = (Number(d[0]) * 60 * 60) + (Number(d[1]) * 60) + Number(d[2]);

		let percent = 100 / rect.width * left;
		let time = Math.floor(totalSeconds / rect.width * left);

		PlayerActions.seek(time)
	}

	render () {

		var info = this.state.info;
		var offset = this.state.offset;
		var percent = 0;
		var from = '00:00';
		var to = '-0:00';

		if(info) {
			var r = info.RelTime.split(':');
			var d = info.TrackDuration.split(':');

			var start = moment().startOf('day');
			var now = moment().startOf('day').add(r[0], 'h').add(r[1], 'm').add(Number(r[2]) + offset, 's');
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
					{/*
					<img id="repeat" className="playback-mode" src="images/tc_progress_repeat_normal_off.png" />
					<img id="shuffle"  className="playback-mode" src="images/tc_progress_shuffle_normal_off.png" />
					<img id="crossfade"  className="playback-mode" src="images/tc_progress_crossfade_normal_off.png" />
					*/}
					<span id="countup">{from}</span>
					<div id="position-info-control">
						<div id="position-bar" onClick={this._onClick.bind(this)}>
							<div id="position-bar-scrubber" style={styles}></div>
						</div>
					</div>
					<span id="countdown">{to}</span>
				</div>

			</div>
		);
	}
}

export default PositionInfo;
