import React from 'react/addons';

import AlbumArt from './AlbumArt';

class CurrentTrack extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	render () {
		var currentTrack = this.state.currentTrack || {};
		var nextTrack = this.state.nextTrack || {};
		//var albumArtURI = this.props.cursor.refine('albumArtURI');

		return (
			<div id="current-track-info">
				<AlbumArt id="current-track-art" />
				<div>
					<h6>Track</h6>
					<p id="track">{currentTrack.title}</p>
					<h6>Artist</h6>
					<p id="artist">{currentTrack.artist}</p>
					<h6>Album</h6>
					<p id="album">{currentTrack.album}</p>
				</div>

				<h5>Next</h5>
				<p id="next-track">{nextTrack.title}</p>
			</div>
		);
	}
}

export default CurrentTrack;
