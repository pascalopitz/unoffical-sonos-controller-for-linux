import React from 'react';

export function ZoneGroupMember(props) {
    return (
        <li>
            <span>{props.member.ZoneName}</span>
        </li>
    );
}

export default ZoneGroupMember;
