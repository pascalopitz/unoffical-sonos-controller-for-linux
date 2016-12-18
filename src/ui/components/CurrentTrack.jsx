import { h, Component } from 'preact'; //eslint-disable-line

import CurrentTrackStore from '../stores/CurrentTrackStore';
import CurrentTrackActions from '../actions/CurrentTrackActions';

import AlbumArt from './AlbumArt';

class CurrentTrack extends Component {

	constructor(props) {
		super(props);
		this.state = {
			currentTrack: null,
			nextTrack: null,
			expanded: CurrentTrackStore.getExpanded(),
		};
	}

	componentDidMount() {
		CurrentTrackStore.addChangeListener(this._onChange.bind(this));

		this.setState({

		});
	}

	_onChange() {
		this.setState({
			currentTrack: CurrentTrackStore.getCurrentTrack(),
			nextTrack: CurrentTrackStore.getNextTrack(),
			expanded: CurrentTrackStore.getExpanded(),
		});
	}

	_toggle() {
		CurrentTrackActions.toggleExpanded(!this.state.expanded);
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

		let toggleNode  = this.state.expanded ? <i className="material-icons">expand_less</i> : <i className="material-icons">expand_more</i>;
		let expandClass = this.state.expanded ? 'expanded' : 'collapsed';

		let currentTrackShortInfo;

		if(!this.state.expanded) {
			currentTrackShortInfo = <span id="track-short-info">{currentTrack.title}</span>;
		}

		return (
		<div className={expandClass}>
			<h4 id="now-playing">
				<span>NOW PLAYING</span>

				{currentTrackShortInfo}

				<a id="current-track-toggle-button" onClick={this._toggle.bind(this)}>
					{toggleNode}
				</a>
			</h4>

			<div id="current-track-info">
				<AlbumArt id="current-track-art" src={currentTrack.albumArtURI} parentType="#current-track-info" />
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
		</div>
		);
	}
}

export default CurrentTrack;
