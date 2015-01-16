import model from '../model';
import register from '../helpers/registerComponent';
import ZoneGroup from './ZoneGroup'; 

class ZoneGroupList {

  getInitialState () {
    return {data: []};
  }

  componentDidMount () {
    var self = this;

    model.observe('zoneGroups', function() {
      self.setState({ data: model.zoneGroups });
    });
  }

  componentWillUnmount () {
    // unsubscribe
  }

  render () {
  	let zoneGroupNodes = this.state.data.map(function (g) {
      return (
        <ZoneGroup data={g} />
      );
    });

    return (
    	<div id="zone-wrapper">
    		{{zoneGroupNodes}}
    	</div>
    );
  }
}

ZoneGroupList.prototype.displayName = "ZoneGroupList";
export default register(ZoneGroupList);