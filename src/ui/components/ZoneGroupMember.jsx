import React from 'react';

export function ZoneGroupMember(props) {
    return (
        <li>
            <span>{props.member.name}</span>
        </li>
    );
}

export default ZoneGroupMember;
