import register from '../helpers/registerComponent';
import model from '../model';

import AlbumArt from './AlbumArt';

class CurrentTrack {

	getInitialState () {
		return {
			track: {

			}
		}
	}

	componentDidMount () {
		var self = this;

		model.observe('currentTrack', function() {
			self.setState({
				track: model.currentTrack
			});
		});
	}	

	render () {
		var track = this.state.track;

		return (
			<div id="current-track-info">
				<AlbumArt id="current-track-art" src={track.albumArtURI} />
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
export default register(CurrentTrack);