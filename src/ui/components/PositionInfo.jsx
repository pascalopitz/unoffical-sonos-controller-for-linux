import _ from 'lodash';

import moment from 'moment';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import {
    setPlayMode,
    setCrossfade,
    seek,
    refreshPosition
} from '../reduxActions/PlayerActions';

import {
    getPlaying,
    getCrossfadeMode,
    getPlayMode,
    getPositionInfo
} from '../selectors/PlayerSelectors';

const mapStateToProps = state => {
    return {
        isPlaying: getPlaying(state),
        info: getPositionInfo(state),
        playMode: getPlayMode(state),
        isCrossfade: getCrossfadeMode(state)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setPlayMode: mode => dispatch(setPlayMode(mode)),
        setCrossfade: mode => dispatch(setCrossfade(mode)),
        seek: position => dispatch(seek(position)),
        refreshPosition: () => dispatch(refreshPosition())
    };
};

function formatTime(d) {
    const hrs = _.padStart(d.hours(), 2, '0');
    const mins = _.padStart(d.minutes(), 2, '0');
    const secs = _.padStart(d.seconds(), 2, '0');

    return `${hrs}:${mins}:${secs}`;
}

export class PositionInfo extends Component {
    constructor() {
        super();

        this.state = {
            offset: 0
        };

        this._interval = null;
    }

    componentWillReceiveProps(props) {
        if (!_.isMatch(props.info, this.props.info)) {
            this.setState({
                offset: 0
            });
        }
    }

    componentDidMount() {
        this.startInterval();
    }

    componentWillUnmount() {
        this.cleanInterval();
    }

    startInterval() {
        this.cleanInterval();
        this._interval = window.setInterval(this._onInterval.bind(this), 1000);
    }

    cleanInterval() {
        if (this._interval) {
            window.clearInterval(this._interval);
        }
        this._interval = null;
    }

    _toggleRepeat() {
        if (this.props.playMode === 'NORMAL') {
            this.props.setPlayMode('REPEAT_ALL');
        }

        if (this.props.playMode === 'REPEAT_ALL') {
            this.props.setPlayMode('REPEAT_ONE');
        }

        if (this.props.playMode === 'REPEAT_ONE') {
            this.props.setPlayMode('NORMAL');
        }

        if (this.props.playMode === 'SHUFFLE') {
            this.props.setPlayMode('SHUFFLE_REPEAT_ONE');
        }

        if (this.props.playMode === 'SHUFFLE_REPEAT_ONE') {
            this.props.setPlayMode('SHUFFLE_NOREPEAT');
        }

        if (this.props.playMode === 'SHUFFLE_NOREPEAT') {
            this.props.setPlayMode('SHUFFLE');
        }
    }

    _toggleShuffle() {
        if (this.props.playMode === 'NORMAL') {
            this.props.setPlayMode('SHUFFLE_NOREPEAT');
        }

        if (this.props.playMode === 'REPEAT_ALL') {
            this.props.setPlayMode('SHUFFLE');
        }

        if (this.props.playMode === 'REPEAT_ONE') {
            this.props.setPlayMode('SHUFFLE_REPEAT_ONE');
        }

        if (this.props.playMode === 'SHUFFLE') {
            this.props.setPlayMode('REPEAT_ALL');
        }

        if (this.props.playMode === 'SHUFFLE_REPEAT_ONE') {
            this.props.setPlayMode('REPEAT_ONE');
        }

        if (this.props.playMode === 'SHUFFLE_NOREPEAT') {
            this.props.setPlayMode('NORMAL');
        }
    }

    _toggleCrossfade() {
        this.props.setCrossfade(!this.props.isCrossfade);
    }

    _onInterval() {
        if (this.props.isPlaying) {
            this.setState({
                offset: this.state.offset + 1
            });
        }
    }

    _onClick(e) {
        const { info } = this.props;

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
        const time = Math.floor(totalSeconds / rect.width * left);

        this.props.seek(time);
    }

    render() {
        const { info } = this.props;
        const { offset } = this.state;

        let percent = 0;
        let fromStr = '00:00';
        let toStr = '-00:00';

        if (info) {
            let now = moment.duration(info.RelTime).add(offset, 's');
            const end = moment.duration(info.TrackDuration);

            if (end.asSeconds() > 0) {
                if (now > end) {
                    now = moment.duration(info.TrackDuration);
                    this.props.refreshPosition();
                }

                const to = moment
                    .duration(end.asSeconds(), 'seconds')
                    .subtract(now.asSeconds(), 's');

                toStr = `-${formatTime(to)}`;
                percent = 100 / end.asSeconds() * now.asSeconds();
            }

            fromStr = `${formatTime(now)}`;
        }

        const styles = {
            left: String(Math.round(percent)) + '%'
        };

        let repeat = <i className="material-icons repeat">repeat</i>;
        let shuffle = <i className="material-icons shuffle">shuffle</i>;

        switch (this.props.playMode) {
            case 'NORMAL':
                break;

            case 'SHUFFLE':
            case 'REPEAT_ALL':
                repeat = <i className="material-icons repeat active">repeat</i>;
                break;

            case 'REPEAT_ONE':
            case 'SHUFFLE_REPEAT_ONE':
                repeat = (
                    <i className="material-icons repeat active">repeat_one</i>
                );
                break;
        }

        switch (this.props.playMode) {
            case 'SHUFFLE':
            case 'SHUFFLE_NOREPEAT':
            case 'SHUFFLE_REPEAT_ONE':
                shuffle = (
                    <i className="material-icons shuffle active">shuffle</i>
                );
                break;
        }

        let crossfade = (
            <i className="material-icons crossfade">import_export</i>
        );

        if (this.props.isCrossfade) {
            crossfade = (
                <i className="material-icons crossfade active">import_export</i>
            );
        }

        return (
            <div id="position-info">
                <img
                    className="left"
                    src="images/tc_progress_container_left.png"
                />
                <img
                    className="right"
                    src="images/tc_progress_container_right.png"
                />
                <div className="content">
                    <a onClick={this._toggleRepeat.bind(this)}>{repeat}</a>
                    <a onClick={this._toggleShuffle.bind(this)}>{shuffle}</a>
                    <a onClick={this._toggleCrossfade.bind(this)}>
                        {crossfade}
                    </a>

                    <span id="countup">{fromStr}</span>
                    <div id="position-info-control">
                        <div
                            id="position-bar"
                            onClick={this._onClick.bind(this)}
                        >
                            <div id="position-bar-scrubber" style={styles} />
                        </div>
                    </div>
                    <span id="countdown">{toStr}</span>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PositionInfo);
