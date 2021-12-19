import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

const { play, pause, playNext, playPrev } = window.PlayerActions;

import {
    getPlaying,
    isStreaming,
    disableNextButton,
} from '../../common/selectors/PlayerSelectors';

const mapStateToProps = (state) => {
    return {
        isStreaming: isStreaming(state),
        disableNextButton: disableNextButton(state),
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
    const { isStreaming, disableNextButton, playing, pause, play } = props;
    const src = playing ? 'svg/pause.svg' : 'svg/play.svg';

    const _toggle = () => {
        if (playing) {
            pause();
        } else {
            play();
        }
    };

    const cssprev = classnames({
        disabled: isStreaming,
    });

    const cssnext = classnames({
        disabled: disableNextButton,
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
                className={cssprev}
            />
            <div id="play-pause" className="play" onClick={_toggle}>
                <img id="play" src={src} />
            </div>
            <img
                id="next"
                src="svg/next.svg"
                onClick={() => {
                    if (!disableNextButton) {
                        props.next();
                    }
                }}
                className={cssnext}
            />
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayControls);
