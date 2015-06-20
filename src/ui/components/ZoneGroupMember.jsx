"use strict";

import React from 'react/addons';

class ZoneGroupMember extends React.Component {
	render () {
		return (
			<li>
				<span>{this.props.member.name}</span>
			</li>
		);
	}
}

export default ZoneGroupMember;