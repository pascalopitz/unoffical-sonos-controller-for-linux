import React from 'react/addons';

import SonosService from '../services/SonosService';
import resourceLoader from '../helpers/resourceLoader';

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
			return;
		}

		let sonos = SonosService._currentDevice;
		let url = this.props.src;
		let srcUrl = (url.indexOf('http://') === 0) ? url : 'http://' + sonos.host + ':' + sonos.port + decodeURIComponent(url);

		resourceLoader.add(srcUrl).then((data) => {
			if(this.props.src === url) {
				this.setState({
					src: data
				});
			}
		}, () => {
			if(this.props.src === url) {
				this.setState({
					failed: true
				});
			}
		});
		resourceLoader.start();
	}

	componentDidUpdate () {
		let visible = this._isVisible();
		let url = this.props.src;

		if(visible && !this.state.src) {
			// wait half a second, to prevent random scrolling fast through viewport 
			// stuff to get loaded
			this.timeout = window.setTimeout(this._loadImage.bind(this), 500)
		}

		if(!visible && this.timeout) {
			window.clearTimeout(this.timeout);
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
		if(props.src !== this.props.src) {
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