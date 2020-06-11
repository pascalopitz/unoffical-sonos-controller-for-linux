import React, { Component } from 'react';
import { connect } from 'react-redux';

import classnames from 'classnames';

import { hide, setValue, select } from '../reduxActions/EqActions';
import { getPlayers } from '../selectors/GroupManagementSelectors';

import ValueSlider from './ValueSlider';

const mapStateToProps = (state) => {
    return {
        ...state.eq,
        players: getPlayers(state),
    };
};

const mapDispatchToProps = {
    hide,
    setValue,
    select,
};

const toPercentage = (input, min, max) =>
    Math.round(((input - min) * 100) / (max - min));

const fromPercentage = (percentage, min, max) =>
    Math.round((percentage * (max - min)) / 100 + min);

export class EqSettings extends Component {
    _changeValue = (name, value) => {
        const { host, setValue } = this.props;

        setValue({
            host,
            name,
            value,
        });
    };

    _hide = () => {
        this.props.hide();
    };

    render() {
        const { visible, players, host, eqState } = this.props;

        if (!visible || !host) {
            return null;
        }

        const { bass = 0, treble = 0 } = eqState[host] || {};
        const player = players.find((p) => p.host === host);

        return (
            <div
                id="eq-settings-management"
                className={classnames({
                    modal: true,
                })}
            >
                <div id="eq-settings-container" className="modal-inner">
                    <h3>EQ {player.ZoneName}</h3>

                    <select
                        className="player-selector"
                        onChange={(e) => this.props.select(e.target.value)}
                        value={host}
                    >
                        {players.map((p) => (
                            <option key={p.UUID} value={p.host}>
                                {p.ZoneName}
                            </option>
                        ))}
                    </select>

                    <div className="row">
                        <span className="label">Bass ({bass})</span>
                        <ValueSlider
                            value={toPercentage(bass, -10, +10)}
                            dragHandler={(percentage) =>
                                this._changeValue(
                                    'bass',
                                    fromPercentage(percentage, -10, +10)
                                )
                            }
                        />
                    </div>

                    <div className="row">
                        <span className="label">Treble ({treble})</span>
                        <ValueSlider
                            value={toPercentage(treble, -10, +10)}
                            dragHandler={(percentage) =>
                                this._changeValue(
                                    'treble',
                                    fromPercentage(percentage, -10, +10)
                                )
                            }
                        />
                    </div>

                    <button onClick={this._hide} className="save-button">
                        Done
                    </button>
                </div>
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EqSettings);
