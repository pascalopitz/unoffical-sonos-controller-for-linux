import { h } from 'preact';

export function ZoneGroupPLayState(props) {
    const { playState } = props;

    if (playState && playState.trackInfo && playState.trackInfo.title) {
        const icon = playState.isPlaying
            ? <i className="material-icons">play_arrow</i>
            : <i className="material-icons">pause</i>;
        let info = playState.trackInfo.title;

        if (playState.trackInfo.artist) {
            info = info + ' - ' + playState.trackInfo.artist;
        }

        return (
            <div className="play-state">
                {icon} {info}
            </div>
        );
    }

    return <div className="play-state" />;
}

export default ZoneGroupPLayState;
