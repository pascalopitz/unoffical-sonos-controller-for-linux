import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

class ZoneGroupMember extends ImmutableMixin {
	render () {
		return (
			<li>
				<span>{this.props.member.value.$.ZoneName}</span>
			</li>
		);
	}
}

ZoneGroupMember.propTypes = {
	member: React.PropTypes.instanceOf(Cursor).isRequired
};
export default ZoneGroupMember;