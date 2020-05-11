import React from 'react';

export function ZoneGroupPlayState(props) {
    const { currentTrack, playState } = props;

    if (currentTrack && currentTrack.title) {
        const icon =
            playState === 'playing' ? (
                <i className="material-icons">play_arrow</i>
            ) : (
                <i className="material-icons">pause</i>
            );
        let info = currentTrack.title;

        if (currentTrack.artist) {
            info = info + ' - ' + currentTrack.artist;
        }

        return (
            <div className="play-state">
                {icon} {info}
            </div>
        );
    }

    return <div className="play-state" />;
}

export default ZoneGroupPlayState;
