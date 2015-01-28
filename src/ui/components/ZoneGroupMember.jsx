import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class ZoneGroupMember {
  render () {
    return (
    	<li>
    		<span>{this.props.member.value.$.ZoneName}</span>
    	</li>
	);
  }
}

ZoneGroupMember.prototype.displayName = "ZoneGroupMember";
ZoneGroupMember.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
ZoneGroupMember.prototype.propTypes = {
	member: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(ZoneGroupMember.prototype);