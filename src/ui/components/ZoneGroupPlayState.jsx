import React from 'react';

export function ZoneGroupPlayState(props) {
    const { playState } = props;

    if (playState && playState.title) {
        const icon = playState.isPlaying ? (
            <i className="material-icons">play_arrow</i>
        ) : (
            <i className="material-icons">pause</i>
        );
        let info = playState.title;

        if (playState.artist) {
            info = info + ' - ' + playState.artist;
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
