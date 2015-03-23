import AlbumArt from './AlbumArt';

import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from './mixins/ImmutableMixin';

class CurrentTrack extends ImmutableMixin {
	render () {
		var currentTrack = this.props.currentTrack.value;
		var nextTrack = this.props.nextTrack.value;
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

CurrentTrack.propTypes = {
	currentTrack: React.PropTypes.instanceOf(Cursor).isRequired,
	nextTrack: React.PropTypes.instanceOf(Cursor).isRequired
};
export default CurrentTrack;
