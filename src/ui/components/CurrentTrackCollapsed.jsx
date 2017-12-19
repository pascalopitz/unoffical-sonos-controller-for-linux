import { h } from 'preact';

export default function CurrentTrackCollapsed(props) {
    const { currentTrack } = props;

    let info = currentTrack.title;

    if (currentTrack.artist) {
        info = info + ' - ' + currentTrack.artist;
    }

    return (
        <div className="collapsed">
            <h4 id="now-playing">
                <span id="track-short-info">{info}</span>

                <a
                    id="current-track-toggle-button"
                    className="current-track-toggle-button"
                    onClick={props.toggle}
                >
                    <i className="material-icons">expand_more</i>
                </a>
            </h4>
        </div>
    );
}
