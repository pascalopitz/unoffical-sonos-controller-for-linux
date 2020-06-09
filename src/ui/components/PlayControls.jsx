import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { play, pause, playNext, playPrev } from '../reduxActions/PlayerActions';

import { getPlaying, isStreaming } from '../selectors/PlayerSelectors';

const mapStateToProps = (state) => {
    return {
        isStreaming: isStreaming(state),
        playing: getPlaying(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        play: () => dispatch(play()),
        pause: () => dispatch(pause()),
        prev: () => dispatch(playPrev()),
        next: () => dispatch(playNext()),
    };
};

export function PlayControls(props) {
    const { isStreaming, playing, pause, play } = props;
    const src = playing ? 'svg/pause.svg' : 'svg/play.svg';

    const _toggle = () => {
        if (playing) {
            pause();
        } else {
            play();
        }
    };

    const css = classnames({
        disabled: isStreaming,
    });

    return (
        <div id="controls">
            <img
                id="prev"
                src="svg/prev.svg"
                onClick={() => {
                    if (!isStreaming) {
                        props.prev();
                    }
                }}
                className={css}
            />
            <div id="play-pause" className="play" onClick={_toggle}>
                <img id="play" src={src} />
            </div>
            <img
                id="next"
                src="svg/next.svg"
                onClick={() => {
                    if (!isStreaming) {
                        props.next();
                    }
                }}
                className={css}
            />
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayControls);
