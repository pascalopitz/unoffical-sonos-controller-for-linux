import _ from 'lodash';
import { h } from 'preact';
import { connect } from 'preact-redux';

import ZoneGroupPlayState from './ZoneGroupPlayState';

import {
    showGroupManagement,
    selectGroup
} from '../reduxActions/ZoneGroupActions';

import ZoneGroupMember from './ZoneGroupMember';

const mapDispatchToProps = dispatch => {
    return {
        showManagement: group => dispatch(showGroupManagement(group)),
        selectGroup: group => dispatch(selectGroup(group))
    };
};

export function ZoneGroup(props) {
    const _onClick = () => {
        props.selectGroup(props.group);
    };

    const _showGroupManagement = e => {
        props.showManagement(props.group);
        e.preventDefault();
        e.stopPropagation();
    };

    const items = props.group;

    if (!items) {
        return null;
    }

    const coordinator = _(items).find({
        coordinator: 'true'
    });

    const playState = coordinator
        ? props.playStates[coordinator.host] || {}
        : null;

    const zoneNodes = items.map((item, index) =>
        <ZoneGroupMember member={item} key={index} />
    );

    let classString = 'not-selected';

    if (
        props.currentHost &&
        coordinator &&
        coordinator.host === props.currentHost
    ) {
        classString = 'selected';
    }

    classString += ' zone-group';

    return (
        <div className={classString} onClick={_onClick}>
            <ul>
                {zoneNodes}
            </ul>

            <div className="group-button" onClick={_showGroupManagement}>
                Group
            </div>

            <ZoneGroupPlayState playState={playState} />
        </div>
    );
}

export default connect(null, mapDispatchToProps)(ZoneGroup);
