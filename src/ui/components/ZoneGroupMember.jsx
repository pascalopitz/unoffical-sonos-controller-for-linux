import React from 'react/addons';

class ZoneGroupMember extends React.Component {
	render () {
		return (
			<li>
				<span>{this.props.member.$.ZoneName}</span>
			</li>
		);
	}
}

export default ZoneGroupMember;