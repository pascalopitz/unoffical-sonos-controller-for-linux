var React = require('react/addons');

class ZoneGroupMember {
  render () {
    return (
    	<li>
    		<span>{this.props.data.ZoneName}</span>
    	</li>
	);
  }
}

ZoneGroupMember.prototype.displayName = "ZoneGroupMember";
export default React.createClass(ZoneGroupMember.prototype);