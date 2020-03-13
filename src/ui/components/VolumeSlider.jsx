import _ from 'lodash';

import React, { Component } from 'react';

class VolumeSlider extends Component {
    constructor() {
        super();
        this.state = { dragging: false };
    }

    _onStart(e) {
        this.setState({
            dragging: true,
            volume: Number(e.target.value)
        });

        this.props.startHandler();
    }

    _onStop() {
        this.setState({
            dragging: false,
            volume: null
        });

        this.props.stopHandler();
    }

    _onChange(e) {
        const volume = e.target.value;

        this.setState({
            dragging: true,
            volume: Number(e.target.value)
        });

        this._setVolume(volume);
    }

    _setVolume(volume) {
        this.props.dragHandler(volume);
    }

    _onWheel(e) {
        this._setVolume(this._getVolume() + (e.deltaY > 0 ? -1 : 1));
    }

    _getVolume() {
        return this.state.dragging
            ? this.state.volume
            : Number(this.props.volume);
    }

    render() {
        const volume = this._getVolume();

        return (
            <div className="volume-bar">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number(volume)}
                    onMouseDown={this._onStart.bind(this)}
                    onMouseUp={this._onStop.bind(this)}
                    onInput={_.throttle(this._onChange.bind(this), 100)}
                    onWheel={_.throttle(this._onWheel.bind(this), 100)}
                />
            </div>
        );
    }
}

export default VolumeSlider;
