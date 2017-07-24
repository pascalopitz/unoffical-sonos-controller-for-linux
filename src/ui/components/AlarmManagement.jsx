import _ from 'lodash';
import { h, Component } from 'preact'; //eslint-disable-line

import AlarmManagementStore from '../stores/AlarmManagementStore';
import AlarmManagementActions from '../actions/AlarmManagementActions';

const AlarmListRow = ({ alarm }) =>
    <li key={alarm.ID}>
        <span>
            {alarm.StartTime} - {alarm.Recurrence} -
            {alarm.Enabled === '1' ? 'On' : 'Off'}
        </span>
        <i
            onClick={() => AlarmManagementActions.editAlarm(alarm)}
            className="material-icons"
        >
            mode_edit
        </i>
    </li>;

const AlarmList = ({ alarms }) =>
    <div id="alarm-management" className="modal">
        <div id="alarm-management-container" className="modal-container">
            <h3>Alarms</h3>

            <ul>
                {_.map(alarms, a => <AlarmListRow alarm={a} />)}
            </ul>

            <button
                onClick={AlarmManagementActions.hideManagement}
                className="cancel-button"
            >
                Cancel
            </button>
        </div>
    </div>;

class AlarmForm extends Component {
    _save() {
        // noop
    }

    render() {
        const { alarm } = this.props;

        return (
            <div id="alarm-management" className="modal">
                <div
                    id="alarm-management-container"
                    className="modal-container"
                >
                    <h3>Edit Alarm</h3>
                    <ul>
                        <li>
                            <span>Active</span>
                            <i className="material-icons checkbox">
                                {alarm.Enabled === '1'
                                    ? 'check_box_outline_blank'
                                    : 'check_box'}
                            </i>
                        </li>
                        <li>
                            <span className="label">Start Time</span>
                            <input type="time" value={alarm.StartTime} />
                        </li>
                        <li>
                            <span className="label">Room</span>
                            {alarm.RoomUUID}
                        </li>
                        <li>
                            <span className="label">Duration</span>
                            {alarm.Duration}
                        </li>
                    </ul>

                    <button
                        onClick={AlarmManagementActions.hideManagement}
                        className="cancel-button"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={this._save.bind(this)}
                        className="save-button"
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }
}

export default class AlarmManagement extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        AlarmManagementStore.addChangeListener(this._onChange.bind(this));
    }

    _onChange() {
        this.setState({
            visibility: AlarmManagementStore.visibility,
            alarms: AlarmManagementStore.alarms,
            currentAlarm: AlarmManagementStore.currentAlarm
        });
    }

    render() {
        if (!this.state.visibility) {
            return null;
        }

        if (this.state.alarms && !this.state.currentAlarm) {
            return <AlarmList alarms={this.state.alarms} />;
        }

        if (this.state.currentAlarm) {
            return <AlarmForm alarm={this.state.currentAlarm} />;
        }
    }
}
