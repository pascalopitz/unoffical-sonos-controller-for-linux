import _ from 'lodash';

import { h, Component } from 'preact'; //eslint-disable-line

import MuteButton from './MuteButton';
import VolumeSlider from './VolumeSlider';

import VolumeControlActions from '../actions/VolumeControlActions';
import VolumeControlStore from '../stores/VolumeControlStore';

class VolumeControls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: VolumeControlStore.getPlayers()
        };
    }

    componentDidMount() {
        VolumeControlStore.addChangeListener(this._onChange.bind(this));
    }

    _onChange() {
        if (!this.state.dragging) {
            this.setState({
                players: VolumeControlStore.getPlayers()
            });
        }
    }

    _toggleGoupMute(e) {
        const muted = this._calculateGroupMuted();

        Object.keys(this.state.players).forEach(host => {
            VolumeControlActions.setPlayerMuted(host, !muted);
        });
    }

    _changeGroupVolume(volume) {
        const keys = Object.keys(this.state.players);
        const state = _.cloneDeep(this.state);

        state.isExpanded = true;

        // adjust all players in group
        const volumeLevel = volume;
        const groupVolume = this._calculateGroupVolume();
        const deltaVolume = volumeLevel - groupVolume;
        let newVolume;

        keys.forEach(key => {
            if (volumeLevel < 1) {
                newVolume = 0;
            } else if (deltaVolume > 0) {
                newVolume = this.state.players[key].volume + deltaVolume;
            } else {
                const factor = this.state.players[key].volume / groupVolume;
                newVolume = Math.ceil(factor * volumeLevel);
            }

            if (newVolume > 99) {
                newVolume = 99;
            }

            if (newVolume <= 0) {
                newVolume = 0;
            }

            state.players[key].volume = newVolume;
            VolumeControlActions.setPlayerVolume(key, newVolume);
        });

        this.setState(state);
    }

    _startGroupVolume() {
        const keys = Object.keys(this.state.players);

        this._dragStart();
        this.setState({
            isExpanded: keys.length > 1
        });
    }

    _endGroupVolume() {
        this._dragEnd();
        this._hideTimeStart();
    }

    _dragStart() {
        if (this._dragEndTimer) {
            window.clearTimeout(this._dragEndTimer);
        }

        this.setState({
            dragging: true
        });
    }

    _dragEnd() {
        this._dragEndTimer = window.setTimeout(() => {
            this.setState({
                dragging: false
            });
            VolumeControlActions.queryVolumes();
        }, 500);
    }

    _hideTimeStart() {
        this._hideTimer = window.setTimeout(() => {
            this.setState({
                isExpanded: false
            });
        }, 1000);
    }

    _hideTimeStop() {
        window.clearTimeout(this._hideTimer);
    }

    _calculateGroupMuted() {
        return _.filter(this.state.players, { muted: false }).length === 0;
    }

    _calculateGroupVolume() {
        const keys = Object.keys(this.state.players);

        if (!keys.length) {
            return 0;
        }

        const volume = Math.floor(
            _.sum(_.map(this.state.players, p => Number(p.volume))) /
                keys.length
        );
        return volume;
    }

    render() {
        let groupMuted = false;
        let groupVolume = 0;
        let playerPopover;

        const keys = Object.keys(this.state.players);

        if (keys.length === 1) {
            groupMuted = this.state.players[keys[0]].muted;
            groupVolume = this.state.players[keys[0]].volume;
        } else {
            groupMuted = this._calculateGroupMuted();
            groupVolume = this._calculateGroupVolume();
        }

        if (this.state.isExpanded && keys.length > 1) {
            const playerRows = Object.keys(this.state.players).map(key => {
                const muted = this.state.players[key].muted;
                const volume = this.state.players[key].volume;
                const name = this.state.players[key].name;

                const startVolume = () => {
                    this._dragStart();
                    this.setState({
                        dragging: true
                    });
                };

                const endVolume = () => {
                    this._dragEnd();
                };

                const changeVolume = volume => {
                    const state = _.cloneDeep(this.state);
                    state.isExpanded = true;
                    state.players[key].volume = volume;

                    this.setState(state);
                    VolumeControlActions.setPlayerVolume(key, volume);
                };

                const toggleMute = () => {
                    VolumeControlActions.setPlayerMuted(key, !muted);
                };

                return (
                    <div key={key}>
                        <h6>
                            {name}
                        </h6>

                        <MuteButton muted={muted} clickHandler={toggleMute} />

                        <VolumeSlider
                            volume={volume}
                            stopHandler={endVolume}
                            startHandler={startVolume}
                            dragHandler={changeVolume}
                        />
                    </div>
                );
            });

            playerPopover = (
                <div
                    id="player-volumes-container"
                    onMouseOut={this._hideTimeStart.bind(this)}
                    onMouseOver={this._hideTimeStop.bind(this)}
                >
                    <div id="player-volumes">
                        {playerRows}
                    </div>
                </div>
            );
        }

        return (
            <div id="master-volume">
                <MuteButton
                    muted={groupMuted}
                    clickHandler={this._toggleGoupMute.bind(this)}
                />

                <VolumeSlider
                    volume={groupVolume}
                    stopHandler={this._endGroupVolume.bind(this)}
                    startHandler={this._startGroupVolume.bind(this)}
                    dragHandler={this._changeGroupVolume.bind(this)}
                />

                {playerPopover}
            </div>
        );
    }
}

export default VolumeControls;
