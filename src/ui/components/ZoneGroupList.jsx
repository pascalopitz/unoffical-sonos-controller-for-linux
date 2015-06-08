import React from 'react/addons';

import sort from '../helpers/sort';

import ZoneGroup from './ZoneGroup';
import ZoneGroupStore from '../stores/ZoneGroupStore';

class ZoneGroupList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			groups: ZoneGroupStore.getAll(),
			current: ZoneGroupStore.getCurrent(),
		};
	}

	componentDidMount() {
		ZoneGroupStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		this.setState({
			groups: ZoneGroupStore.getAll(),
			current: ZoneGroupStore.getCurrent(),
		});
	}

	render () {

		var items = this.state.groups.sort((item1, item2) => {
			var members1 = item1.ZoneGroupMember.sort(sort.asc);
			var members2 = item2.ZoneGroupMember.sort(sort.asc);

			return sort.asc(members1[0], members2[0]);
		});

		var zoneGroupNodes = items.map((item, index) => {
			if(item.ZoneGroupMember[0].$.IsZoneBridge) {
				return;
			}

			return (
				<ZoneGroup group={item} currentZone={this.state.current} />
			);
		});

		return (
			<div id="zone-wrapper">
				{{zoneGroupNodes}}
			</div>
		);
	}
}

export default ZoneGroupList;