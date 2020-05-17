import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import ZoneGroupPlayState from './ZoneGroupPlayState';
import ZoneGroupMember from './ZoneGroupMember';

import {
    showGroupManagement,
    selectGroup,
} from '../reduxActions/ZoneGroupActions';

const mapDispatchToProps = (dispatch) => {
    return {
        showManagement: (group) => dispatch(showGroupManagement(group)),
        selectGroup: (group) => dispatch(selectGroup(group)),
    };
};

export function ZoneGroup(props) {
    const {
        group,
        showManagement,
        selectGroup,
        playStates,
        currentHost,
    } = props;

    const _onClick = () => {
        selectGroup(group);
    };

    const _showGroupManagement = (e) => {
        showManagement(group);
        e.preventDefault();
        e.stopPropagation();
    };

    const playState = playStates[group.host] || {};

    const zoneNodes = group.ZoneGroupMember.map((item, index) => (
        <ZoneGroupMember member={item} key={index} />
    ));

    let classString = 'not-selected';

    if (currentHost && group.host === currentHost) {
        classString = 'selected';
    }

    classString += ' zone-group';

    return (
        <div className={classString} onClick={_onClick}>
            <ul>{zoneNodes}</ul>

            <div className="group-button" onClick={_showGroupManagement}>
                Group
            </div>

            <ZoneGroupPlayState playState={playState} />
        </div>
    );
}

export default connect(null, mapDispatchToProps)(ZoneGroup);
