import _ from 'lodash';
import React from 'react/addons';

import sort from '../helpers/sort';
import ZoneGroupActions from '../actions/ZoneGroupActions';

import ZoneGroupMember from './ZoneGroupMember'; 

class ZoneGroup extends React.Component {

	render () {
		var items = this.props.group;

		if(!items) {
			return null;
		}

		var coordinator = _(items).findWhere({
			coordinator: "true"
		});

		var zoneNodes = items.map(function (item, index) {
			return (
				<ZoneGroupMember member={item} />
			);
		});

		var classString = 'not-selected'

		if(this.props.currentZone && coordinator.uid === this.props.currentZone.uid) {
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