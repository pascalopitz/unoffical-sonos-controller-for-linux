import React from 'react';

import AlbumArt from './AlbumArt';

export default function CurrentTrackExpanded(props) {
    let nextTrackInfo;
    const { currentTrack, nextTrack } = props;

    if (nextTrack && nextTrack.title) {
        nextTrackInfo = (
            <p id="next-track">
                {nextTrack.title} - {nextTrack.artist}
            </p>
        );
    }

    return (
        <div className="expanded">
            <h4 id="now-playing">
                <span>NOW PLAYING</span>

                <a
                    id="current-track-toggle-button"
                    className="current-track-toggle-button"
                    onClick={props.toggle}
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
