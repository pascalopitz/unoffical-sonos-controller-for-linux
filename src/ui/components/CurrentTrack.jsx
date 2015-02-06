import AlbumArt from './AlbumArt';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class CurrentTrack {
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

CurrentTrack.prototype.displayName = "CurrentTrack";
CurrentTrack.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
CurrentTrack.prototype.propTypes = {
	currentTrack: React.PropTypes.instanceOf(Cursor).isRequired,
	nextTrack: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(CurrentTrack.prototype);
