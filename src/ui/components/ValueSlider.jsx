import throttle from 'lodash/throttle';
import React, { Component } from 'react';

class VolumeSlider extends Component {
    constructor() {
        super();
        this.state = { dragging: false };
    }

    _onStart(e) {
        this.setState({
            dragging: true,
            value: Number(e.target.value),
        });

        if (this.props.startHandler) {
            this.props.startHandler();
        }
    }

    _onStop() {
        this.setState({
            dragging: false,
            value: null,
        });

        if (this.props.stopHandler) {
            this.props.stopHandler();
        }
    }

    _onChange(e) {
        const value = e.target.value;

        this.setState({
            dragging: true,
            value: Number(e.target.value),
        });

        this._setValue(value);
    }

    _setValue(value) {
        this.props.dragHandler(value);
    }

    _onWheel(e) {
        this._setValue(this._getValue() + (e.deltaY > 0 ? -1 : 1));
    }

    _getValue() {
        return this.state.dragging
            ? this.state.value
            : Number(this.props.value);
    }

    render() {
        const value = this._getValue();

        return (
            <div className="value-bar">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Number(value)}
                    onChange={() => {}}
                    onMouseDown={this._onStart.bind(this)}
                    onMouseUp={this._onStop.bind(this)}
                    onInput={throttle(this._onChange.bind(this), 100)}
                    onWheel={throttle(this._onWheel.bind(this), 100)}
                />
            </div>
        );
    }
}

export default VolumeSlider;
