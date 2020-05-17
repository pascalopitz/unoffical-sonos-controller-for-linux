import React, { Component } from 'react';
import { connect } from 'react-redux';

import GroupManagementNode from './GroupManagementNode';

import {
    hideGroupManagement,
    toggleZoneChecked,
    saveGroups,
} from '../reduxActions/GroupManagementActions';

import { getPlayers } from '../selectors/GroupManagementSelectors';

const mapStateToProps = (state) => {
    return {
        players: getPlayers(state),
        visible: state.groupManagement.visible,
        selected: state.groupManagement.selected,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideGroupManagement: () => dispatch(hideGroupManagement()),
        toggleZone: (group) => dispatch(toggleZoneChecked(group)),
        saveGroups: (selected) => dispatch(saveGroups(selected)),
    };
};

export class GroupManagement extends Component {
    _cancel() {
        this.props.hideGroupManagement();
    }

    _save() {
        this.props.saveGroups(this.props.selected);
    }

    render() {
        if (!this.props.visible) {
            return null;
        }

        const zoneGroupNodes = this.props.players.map((item, idx) => {
            return (
                <GroupManagementNode key={idx} item={item} {...this.props} />
            );
        });

        return (
            <div id="zone-group-management">
                <div id="zone-group-management-container">
                    <ul>{zoneGroupNodes}</ul>

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

export default connect(mapStateToProps, mapDispatchToProps)(GroupManagement);
