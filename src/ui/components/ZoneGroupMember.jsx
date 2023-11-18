import React from 'react';

export function ZoneGroupMember({ member }) {
    const { isCharging, batteryLevel, ZoneName } = member;

    return (
        <li>
            <span>{ZoneName}</span>
            {batteryLevel ? (
                <span className="battery">
                    {batteryLevel}%
                    <i className="material-icons">
                        {isCharging ? 'battery_charging_full' : 'battery_full'}
                    </i>
                </span>
            ) : null}
        </li>
    );
}

export default ZoneGroupMember;
