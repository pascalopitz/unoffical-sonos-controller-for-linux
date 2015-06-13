import React from 'react/addons';

import SonosService from '../services/SonosService'
import RAL from "apps-resource-loader";

RAL.Queue.skipOnError(true);
RAL.Queue.setMaxConnections(2);

class AlbumArt extends React.Component {

	constructor () {
		super();
		this.state = {
			src: null,
			visible: false,
		};
	}

	_isVisible () {
		let vp = this.props.viewport;
		let rect = React.findDOMNode(this).getBoundingClientRect();

		if(rect.bottom > vp.top && rect.top < vp.bottom) {
			return true;
		}

		if(rect.bottom > vp.top && rect.bottom < vp.bottom) {
			return true;
		}

		return false;
	}

	_loadImage () {
		// here we make sure it's still visible, a URL and hasn't failed previously
		if(!this._isVisible() || !this.props.src || this.state.failed) {
			console.log('No need to load image', this.props.src, this.state.failed);
			return;
		}

		let url = this.props.src;

		let sonos = SonosService._currentDevice;
		var srcUrl = 'http://' + sonos.host + ':' + sonos.port + decodeURIComponent(url);

		var finalImage = new RAL.RemoteImage({
			src: srcUrl,
			priority: RAL.Queue.getNextHighestPriority(),
		});

		finalImage.addEventListener('loaded', (info) => {
			this.setState({
				src: info.data
			});
		});

		finalImage.addEventListener('remoteunavailable', (info) => {
			this.setState({
				failed: true
			});
		});

		RAL.Queue.add(finalImage);
		RAL.Queue.start();
	}

	componentDidUpdate () {
		let visible = this._isVisible();

		if(visible && !this.state.src) {
			// wait half a second, to prevent random scrolling fast through viewport 
			// stuff to get loaded
			this.timeout = window.setTimeout(this._loadImage.bind(this), 500)
		}

		if(this.state.visible !== visible) {
			this.setState({
				visible : visible
			});
		}
	}

	componentWillUnmount () {
		if(this.timeout) {
			window.clearTimeout(this.timeout);
		}
	}

	componentWillReceiveProps(props) {
		// HACK: prevent image ghosting when pressing back button
		if(this.state.visible && props.src !== this.props.src) {
			this.setState({
				src: null,
				failed: null
			});
		}
	}

	render () {

		let src = this.state.src || 'images/browse_missing_album_art.png';

		return (
			<img
			data-visible={this.state.visible}
			src={src} />
		);
	}
}

export default AlbumArt;