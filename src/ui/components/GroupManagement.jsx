import { h, Component } from 'preact'; //eslint-disable-line

import GroupManagementStore from '../stores/GroupManagementStore';
import GroupManagementActions from '../actions/GroupManagementActions';

class GroupManagement extends Component {
    constructor(props) {
        super(props);
        this.state = this._getUpdatedState();
    }

    componentDidMount() {
        GroupManagementStore.addChangeListener(this._onChange.bind(this));
    }

    _onChange() {
        this.setState(this._getUpdatedState());
    }

    _getUpdatedState() {
        const players = GroupManagementStore.getPlayers();
        const current = GroupManagementStore.getCurrent();

        return {
            players: players,
            current: current
        };
    }

    _cancel() {
        GroupManagementActions.hideManagement();
    }

    _save() {
        GroupManagementActions.save();
    }

    render() {
        if (!this.state.current) {
            return null;
        }

        const zoneGroupNodes = this.state.players.map((item, idx) => {
            const checkboxSymbol = item.selected
                ? 'check_box'
                : 'check_box_outline_blank';

            const _toggleSelection = () => {
                if (!item.selected) {
                    GroupManagementActions.select(item);
                } else {
                    GroupManagementActions.deselect(item);
                }
            };

            return (
                <li key={idx}>
                    <span>
                        {item.name}
                    </span>
                    <i
                        className="material-icons checkbox"
                        onClick={_toggleSelection.bind(this)}
                    >
                        {checkboxSymbol}
                    </i>
                </li>
            );
        });

        return (
            <div id="zone-group-management" className="modal">
                <div
                    id="zone-group-management-container"
                    className="modal-container"
                >
                    <ul>
                        {zoneGroupNodes}
                    </ul>

                    <button
                        onClick={this._cancel.bind(this)}
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

export default GroupManagement;
