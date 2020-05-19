import React from 'react';

export function GroupManagementNode(props) {
    const checkboxSymbol =
        props.selected.indexOf(props.item.UUID) > -1
            ? 'check_box'
            : 'check_box_outline_blank';

    const _toggleSelection = () => {
        props.toggleZone(props.item);
    };

    return (
        <li>
            <span>{props.item.ZoneName}</span>
            <i className="material-icons checkbox" onClick={_toggleSelection}>
                {checkboxSymbol}
            </i>
        </li>
    );
}

export default GroupManagementNode;
