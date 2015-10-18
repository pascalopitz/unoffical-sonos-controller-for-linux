import React from 'react';
import ReactDOM from 'react-dom';

import CurrentTrackStore from '../stores/CurrentTrackStore';

import AlbumArt from './AlbumArt';

class CurrentTrack extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			currentTrack: null,
			nextTrack: null,
		};
	}

	componentDidMount() {
		CurrentTrackStore.addChangeListener(this._onChange.bind(this));

		this.setState({
			boundingRect : ReactDOM.findDOMNode(this).getBoundingClientRect()
		});
	}

	_onChange() {
		let currentTrack = CurrentTrackStore.getCurrentTrack();
		let nextTrack = CurrentTrackStore.getNextTrack();

		this.setState({
			currentTrack: currentTrack,
			nextTrack: nextTrack,
		});
	}

	render () {
		let currentTrack = this.state.currentTrack;
		let nextTrack = this.state.nextTrack;

		let nextTrackInfo;

		if(!currentTrack || !currentTrack.title) {
			return <div id="current-track-info">No Music</div>
		}

		if(nextTrack && nextTrack.title) {
			nextTrackInfo = <p id="next-track">{nextTrack.title}</p>
		}

		return (
			<div id="current-track-info">
				<AlbumArt id="current-track-art" src={currentTrack.albumArtURI}
												 viewport={this.state.boundingRect} />
				<div>
					<h6>Track</h6>
					<p id="track">{currentTrack.title}</p>
					<h6>Artist</h6>
					<p id="artist">{currentTrack.artist}</p>
					<h6>Album</h6>
					<p id="album">{currentTrack.album}</p>
				</div>

				<h5>Next</h5>
				{nextTrackInfo}
			</div>
		);
	}
}

export default CurrentTrack;
