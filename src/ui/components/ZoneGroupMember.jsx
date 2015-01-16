import register from '../helpers/registerComponent';

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
export default register(ZoneGroupMember);