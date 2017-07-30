import { h } from 'preact';
import { connect } from 'preact-redux';

import { play, pause, playNext, playPrev } from '../reduxActions/PlayerActions';

import { getPlaying } from '../selectors/PlayerSelectors';

const mapStateToProps = state => {
    return {
        playing: getPlaying(state)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        play: () => dispatch(play()),
        pause: () => dispatch(pause()),
        prev: () => dispatch(playPrev()),
        next: () => dispatch(playNext())
    };
};

export function PlayControls(props) {
    const src = props.playing ? 'svg/pause.svg' : 'svg/play.svg';

    const _toggle = () => {
        if (props.playing) {
            props.pause();
        } else {
            props.play();
        }
    };

    return (
        <div id="controls">
            <img id="prev" src="svg/prev.svg" onClick={props.prev} />
            <div id="play-pause" className="play" onClick={_toggle}>
                <img id="play" src={src} />
            </div>
            <img id="next" src="svg/next.svg" onClick={props.next} />
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayControls);
