"use strict";

import React from 'react';
import ReactDOM from 'react-dom';

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

	_isVisible (props) {
		let vp = props.viewport;
		let rect = ReactDOM.findDOMNode(this).getBoundingClientRect();

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
		if(!this.state.visible || !this.props.src || this.state.failed) {
			return;
		}

		let sonos = SonosService._currentDevice;
		let url = this.props.src;
		let srcUrl = (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) ? url : 'http://' + sonos.host + ':' + sonos.port + decodeURIComponent(url);

		this.srcUrl = srcUrl;
		this.promise = resourceLoader.add(srcUrl).then((data) => {
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

	componentDidMount () {
		this.setState({
			visible: this._isVisible(this.props)
		});
	}

	componentDidUpdate () {
		if(this.state.visible && !this.state.src) {
			// wait half a second, to prevent random scrolling fast through viewport
			// stuff to get loaded
			this.timeout = window.setTimeout(this._loadImage.bind(this), 100)
		}

		if(!this.state.visible && this.timeout) {
			window.clearTimeout(this.timeout);
		}
	}

	componentWillUnmount () {
		if(this.promise) {
			resourceLoader.remove(this.promise, this.srcUrl);
			this.promise = null;
			this.srcUrl = null;
		}

		if(this.timeout) {
			window.clearTimeout(this.timeout);
		}
	}

	componentWillReceiveProps(props) {
		this.setState({
			visible: this._isVisible(props)
		});

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
