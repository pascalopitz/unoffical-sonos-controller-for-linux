import { h, Component } from 'preact'; //eslint-disable-line

import AlarmManagementStore from '../stores/AlarmManagementStore';
import AlarmManagementActions from '../actions/AlarmManagementActions';

class AlarmSettings extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        AlarmManagementStore.addChangeListener(this._onChange.bind(this));
    }

    _onChange() {
        this.setState({
            visibility: AlarmManagementStore.visibility
        });
    }

    _onClick() {
        if (this.state.visibility) {
            AlarmManagementActions.hideManagement();
        } else {
            AlarmManagementActions.showManagement();
        }
    }

    render() {
        return (
            <div className="alarm-settings" onClick={this._onClick.bind(this)}>
                <i className="material-icons">access_alarms</i>
            </div>
        );
    }
}

export default AlarmSettings;
