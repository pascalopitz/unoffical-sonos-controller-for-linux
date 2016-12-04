import { h, Component } from 'preact'; //eslint-disable-line

import SonosService from '../services/SonosService';
import resourceLoader from '../helpers/resourceLoader';

import { getClosest } from '../helpers/dom-utility';

const MIN_RATIO = 0.5;

class AlbumArt extends Component {

	constructor () {
		super();
		this.state = {
			src: null,
			visible: false,
		};
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
		let node = this.base;

		let options = {
			root: getClosest(node, this.props.parentType || 'ul'),
			rootMargin: '0px',
			threshold: MIN_RATIO,
		};

		let callback = ([ entry ]) => {
			this.setState({
				visible: entry.intersectionRatio >= MIN_RATIO,
			});
		};

		this.observer = new IntersectionObserver(callback, options);
		this.observer.observe(node);
	}

	componentDidUpdate () {
		if(this.state.visible && !this.state.src) {
			// wait some time, to prevent random scrolling fast through viewport
			// stuff to get loaded
			this.timeout = window.setTimeout(this._loadImage.bind(this), 500);
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

		if(this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}

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

			if(this.state.visible) {
				this.timeout = window.setTimeout(this._loadImage.bind(this), 500);
			}
		}
	}

	render () {

		let src = this.state.src || 'images/browse_missing_album_art.png';

		let css = {
			backgroundImage: `url(${src})`,
			backgroundSize: 'contain',
		};

		return (
			<div
			className="img"
			data-visible={this.state.visible}
			style={css} />
		);
	}
}

export default AlbumArt;
