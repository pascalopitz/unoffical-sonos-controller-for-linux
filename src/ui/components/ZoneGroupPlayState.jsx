import React from 'react';

export function ZoneGroupPlayState(props) {
    const { currentTrack, playState, mediaInfo } = props;

    const icon =
        playState === 'playing' ? (
            <i className="material-icons">play_arrow</i>
        ) : (
            <i className="material-icons">pause</i>
        );

    let info;

    if (currentTrack && currentTrack.title) {
        info = currentTrack.title;

        if (currentTrack.artist) {
            info = info + ' - ' + currentTrack.artist;
        }
    } else {
        info = mediaInfo?.CurrentURIMetaData?.['dc:title'];
    }

    if (info) {
        return (
            <div className="play-state">
                {icon} {info}
            </div>
        );
    }

    return <div className="play-state" />;
}

export default ZoneGroupPlayState;
