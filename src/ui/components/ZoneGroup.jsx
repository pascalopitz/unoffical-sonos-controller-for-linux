import React from 'react';
import { connect } from 'react-redux';

import ZoneGroupPlayState from './ZoneGroupPlayState';
import ZoneGroupMember from './ZoneGroupMember';

const { showGroupManagement, selectGroup } = window.ZoneGroupActions;

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
        currentTracks,
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

    const playState = playStates[group.host] || 'stopped';
    const currentTrack = currentTracks[group.host] || {};

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
            <ZoneGroupPlayState
                playState={playState}
                currentTrack={currentTrack}
            />
        </div>
    );
}

export default connect(null, mapDispatchToProps)(ZoneGroup);
