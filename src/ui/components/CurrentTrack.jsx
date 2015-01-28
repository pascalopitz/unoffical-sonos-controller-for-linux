import AlbumArt from './AlbumArt';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class CurrentTrack {
	render () {
		var track = this.props.track.value;
		//var albumArtURI = this.props.cursor.refine('albumArtURI');

		return (
			<div id="current-track-info">
				<AlbumArt id="current-track-art" />
				<div>
					<h6>Track</h6>
					<p id="track">{track.title}</p>
					<h6>Artist</h6>
					<p id="artist">{track.artist}</p>
					<h6>Album</h6>
					<p id="album">{track.album}</p>
				</div>

				<h5>Next</h5>
				<p id="next-track"></p>
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
	track: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(CurrentTrack.prototype);