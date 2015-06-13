import React from 'react/addons';
import SonosService from '../services/SonosService'
import RAL from "apps-resource-loader";

RAL.Debugger.activate();
RAL.Queue.skipOnError(true);
RAL.Queue.setMaxConnections(5);

class AlbumArt extends React.Component {

	constructor () {
		super();
		this.state = {
			src: 'images/browse_missing_album_art.png',
			fetched: false,
		};
	}

	componentWillUnmount() {
		this.setState({
			src: 'images/browse_missing_album_art.png',
			fetched: false,
		});
	}

	render () {
		let sonos = SonosService._currentDevice;
		var self = this;

		var id = this.props.id || '';

		if(!this.state.fetched && this.props.src) {
			var srcUrl = 'http://' + sonos.host + ':' + sonos.port + decodeURIComponent(this.props.src);

			// next add in an image (sample-5.png) directly from the script
			// with the highest queue priority
			var finalImage = new RAL.RemoteImage({
				src: srcUrl,
				priority: RAL.Queue.getNextHighestPriority(),
			});

			finalImage.addEventListener('loaded', (info) => {
				this.setState({
					src : info.data,
					fetched: true
				});
				finalImage = null;
			});

			finalImage.addEventListener('remoteunavailable', (info) => {
				this.setState({
					fetched: true
				});
				finalImage = null;
			});

			RAL.Queue.add(finalImage);
			RAL.Queue.start();
		}

		return (
			<img
			id={id}
			src={this.state.src} />
		);
	}
}

export default AlbumArt;