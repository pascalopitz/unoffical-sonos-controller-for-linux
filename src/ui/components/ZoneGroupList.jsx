import model from '../model';
import ZoneGroup from './ZoneGroup'; 

var React = require('react/addons');

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
		var zoneGroupNodes = this.state.data.map(function (g) {
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
export default React.createClass(ZoneGroupList.prototype);