import React from 'react/addons';

import sort from '../helpers/sort';
import ZoneGroupActions from '../actions/ZoneGroupActions';

import ZoneGroupMember from './ZoneGroupMember'; 

class ZoneGroup extends React.Component {

	render () {
		var members = this.props.group.ZoneGroupMember;

		var items = members.sort(sort.asc)

		var zoneNodes = items.map(function (item, index) {
			return (
				<ZoneGroupMember member={item} />
			);
		});

		var classString = 'not-selected'

		if(this.props.currentZone && this.props.currentZone.$.ID === this.props.group.$.ID) {
			classString = 'selected';
		}

		return (
			<ul className={classString} onClick={this._onClick.bind(this)}>
				{{zoneNodes}}
			</ul>
		);
	}

	_onClick () {
		ZoneGroupActions.selectGroup(this.props.group);
	}
}

export default ZoneGroup;