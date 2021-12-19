import padStart from 'lodash/padStart';

import moment from 'moment';
import React, { useCallback, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

const { setPlayMode, setCrossfade, seek, refreshPosition } =
    window.PlayerActions;

import {
    getPlaying,
    getCrossfadeMode,
    getPlayMode,
    getPositionInfo,
    isStreaming,
} from '../../common/selectors/PlayerSelectors';

const mapStateToProps = (state) => {
    return {
        isStreaming: isStreaming(state),
        isPlaying: getPlaying(state),
        info: getPositionInfo(state),
        playMode: getPlayMode(state),
        isCrossfade: getCrossfadeMode(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setPlayMode: (mode) => dispatch(setPlayMode(mode)),
        setCrossfade: (mode) => dispatch(setCrossfade(mode)),
        seek: (position) => dispatch(seek(position)),
        refreshPosition: () => dispatch(refreshPosition()),
    };
};

function formatTime(d) {
    const hrs = padStart(d.hours(), 2, '0');
    const mins = padStart(d.minutes(), 2, '0');
    const secs = padStart(d.seconds(), 2, '0');

    return `${hrs}:${mins}:${secs}`;
}

const ShuffleIcon = (props) => {
    const _toggleShuffle = useCallback(() => {
        if (props.isStreaming) {
            return;
        }

        if (props.playMode === 'NORMAL') {
            props.setPlayMode('SHUFFLE_NOREPEAT');
        }

        if (props.playMode === 'REPEAT_ALL') {
            props.setPlayMode('SHUFFLE');
        }

        if (props.playMode === 'REPEAT_ONE') {
            props.setPlayMode('SHUFFLE_REPEAT_ONE');
        }

        if (props.playMode === 'SHUFFLE') {
            props.setPlayMode('REPEAT_ALL');
        }

        if (props.playMode === 'SHUFFLE_REPEAT_ONE') {
            props.setPlayMode('REPEAT_ONE');
        }

        if (props.playMode === 'SHUFFLE_NOREPEAT') {
            props.setPlayMode('NORMAL');
        }
    }, [props]);

    const css = classnames({
        disabled: props.isStreaming,
    });

    let shuffle = <i className="material-icons shuffle">shuffle</i>;
    switch (props.playMode) {
        case 'SHUFFLE':
        case 'SHUFFLE_NOREPEAT':
        case 'SHUFFLE_REPEAT_ONE':
            shuffle = <i className="material-icons shuffle active">shuffle</i>;
            break;
    }

    return (
        <a onClick={_toggleShuffle} className={css}>
            {shuffle}
        </a>
    );
};

const RepeatIcon = (props) => {
    const _toggleRepeat = useCallback(() => {
        if (props.isStreaming) {
            return;
        }

        if (props.playMode === 'NORMAL') {
            props.setPlayMode('REPEAT_ALL');
        }

        if (props.playMode === 'REPEAT_ALL') {
            props.setPlayMode('REPEAT_ONE');
        }

        if (props.playMode === 'REPEAT_ONE') {
            props.setPlayMode('NORMAL');
        }

        if (props.playMode === 'SHUFFLE') {
            props.setPlayMode('SHUFFLE_REPEAT_ONE');
        }

        if (props.playMode === 'SHUFFLE_REPEAT_ONE') {
            props.setPlayMode('SHUFFLE_NOREPEAT');
        }

        if (props.playMode === 'SHUFFLE_NOREPEAT') {
            props.setPlayMode('SHUFFLE');
        }
    }, [props]);

    const css = classnames({
        disabled: props.isStreaming,
    });

    let repeat = <i className="material-icons repeat">repeat</i>;

    switch (props.playMode) {
        case 'NORMAL':
            break;

        case 'SHUFFLE':
        case 'REPEAT_ALL':
            repeat = <i className="material-icons repeat active">repeat</i>;
            break;

        case 'REPEAT_ONE':
        case 'SHUFFLE_REPEAT_ONE':
            repeat = <i className="material-icons repeat active">repeat_one</i>;
            break;
    }

    return (
        <a onClick={_toggleRepeat} className={css}>
            {repeat}
        </a>
    );
};

const CrossfadeIcon = (props) => {
    const _toggleCrossfade = useCallback(() => {
        if (props.isStreaming) {
            return;
        }
        props.setCrossfade(!props.isCrossfade);
    }, [props]);

    const css = classnames({
        disabled: props.isStreaming,
    });

    let crossfade = <i className="material-icons crossfade">import_export</i>;
    if (props.isCrossfade) {
        crossfade = (
            <i className="material-icons crossfade active">import_export</i>
        );
    }

    return (
        <a onClick={_toggleCrossfade} className={css}>
            {crossfade}
        </a>
    );
};

export const PositionInfo = (props) => {
    const [offset, setOffset] = useState(0);

    const _onInterval = useCallback(() => {
        if (props.isPlaying) {
            setOffset(offset + 1);
        }
    }, [props, offset, setOffset]);

    const _onClick = useCallback(
        (e) => {
            const { info } = props;

            if (!info || !info.TrackDuration) {
                return;
            }

            const element = e.target;
            const rect = element.getBoundingClientRect();
            const left = e.clientX - Math.floor(rect.left);

            const d = info.TrackDuration.split(':');
            const totalSeconds =
                Number(d[0]) * 60 * 60 + Number(d[1]) * 60 + Number(d[2]);

            // const percent = 100 / rect.width * left;
            const time = Math.floor((totalSeconds / rect.width) * left);

            props.seek(time);
        },
        [props.info, props.seek]
    );

    useEffect(() => {
        setOffset(0);
    }, [props.info, setOffset]);

    useEffect(() => {
        const interval = window.setInterval(_onInterval, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, [_onInterval]);

    const { info } = props;

    let percent = 0;
    let fromStr = '00:00';
    let toStr = '-00:00';

    if (info) {
        let now = moment.duration(info.RelTime).add(offset, 's');
        const end = moment.duration(info.TrackDuration);

        if (end.asSeconds() > 0) {
            if (now > end) {
                now = moment.duration(info.TrackDuration);
                props.refreshPosition();
            }

            const to = moment
                .duration(end.asSeconds(), 'seconds')
                .subtract(now.asSeconds(), 's');

            toStr = `-${formatTime(to)}`;
            percent = (100 / end.asSeconds()) * now.asSeconds();
        }

        fromStr = `${formatTime(now)}`;
    }

    const styles = {
        left: String(Math.round(percent)) + '%',
    };

    return (
        <div id="position-info">
            <img className="left" src="images/tc_progress_container_left.png" />
            <img
                className="right"
                src="images/tc_progress_container_right.png"
            />
            <div className="content">
                <RepeatIcon {...props} />
                <ShuffleIcon {...props} />
                <CrossfadeIcon {...props} />

                <span id="countup">{fromStr}</span>
                <div id="position-info-control">
                    <div id="position-bar" onClick={_onClick}>
                        <div id="position-bar-scrubber" style={styles} />
                    </div>
                </div>
                <span id="countdown">{toStr}</span>
            </div>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(PositionInfo);
