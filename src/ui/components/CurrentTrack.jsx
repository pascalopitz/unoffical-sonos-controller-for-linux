import { h, Component } from 'preact';

import CurrentTrackStore from '../stores/CurrentTrackStore';
import CurrentTrackActions from '../actions/CurrentTrackActions';

import AlbumArt from './AlbumArt';

class CurrentTrack extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTrack: null,
            nextTrack: null,
            expanded: CurrentTrackStore.getExpanded()
        };
    }

    componentDidMount() {
        CurrentTrackStore.addChangeListener(this._onChange.bind(this));

        this.setState({});
    }

    _onChange() {
        this.setState({
            currentTrack: CurrentTrackStore.getCurrentTrack(),
            nextTrack: CurrentTrackStore.getNextTrack(),
            expanded: CurrentTrackStore.getExpanded()
        });
    }

    _toggle() {
        CurrentTrackActions.toggleExpanded(!this.state.expanded);
    }

    render() {
        const currentTrack = this.state.currentTrack;
        const nextTrack = this.state.nextTrack;

        let nextTrackInfo;

        if (!currentTrack || !currentTrack.title) {
            const toggleNode = this.state.expanded
                ? <i className="material-icons">expand_less</i>
                : <i className="material-icons">expand_more</i>;
            const expandClass = this.state.expanded ? 'expanded' : 'collapsed';
            return (
                <div className={expandClass}>
                    <h4 id="now-playing">
                        <span>No Music</span>

                        <a
                            id="current-track-toggle-button"
                            className="current-track-toggle-button"
                            onClick={this._toggle.bind(this)}
                        >
                            {toggleNode}
                        </a>
                    </h4>
                </div>
            );
        }

        if (nextTrack && nextTrack.title) {
            nextTrackInfo = (
                <p id="next-track">
                    {nextTrack.title}
                </p>
            );
        }

        if (!this.state.expanded) {
            let info = currentTrack.title;

            if (currentTrack.artist) {
                info = info + ' - ' + currentTrack.artist;
            }

            return (
                <div className="collapsed">
                    <h4 id="now-playing">
                        <span id="track-short-info">
                            {info}
                        </span>

                        <a
                            id="current-track-toggle-button"
                            className="current-track-toggle-button"
                            onClick={this._toggle.bind(this)}
                        >
                            <i className="material-icons">expand_more</i>
                        </a>
                    </h4>
                </div>
            );
        }

        return (
            <div className="expanded">
                <h4 id="now-playing">
                    <span>NOW PLAYING</span>

                    <a
                        id="current-track-toggle-button"
                        className="current-track-toggle-button"
                        onClick={this._toggle.bind(this)}
                    >
                        <i className="material-icons">expand_less</i>
                    </a>
                </h4>

                <div id="current-track-info">
                    <AlbumArt
                        id="current-track-art"
                        src={currentTrack.albumArtURI}
                        parentType="#current-track-info"
                    />
                    <div>
                        <h6>Track</h6>
                        <p id="track">
                            {currentTrack.title}
                        </p>
                        <h6>Artist</h6>
                        <p id="artist">
                            {currentTrack.artist}
                        </p>
                        <h6>Album</h6>
                        <p id="album">
                            {currentTrack.album}
                        </p>
                    </div>

                    <h5>Next</h5>
                    {nextTrackInfo}
                </div>
            </div>
        );
    }
}

export default CurrentTrack;
