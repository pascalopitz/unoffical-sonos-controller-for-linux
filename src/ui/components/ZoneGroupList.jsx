import ZoneGroup from './ZoneGroup'; 

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

import sort from '../helpers/sort';

class ZoneGroupList {

	render () {
		var groups = this.props.zoneGroups;
		var currentZone = this.props.currentZone;

		var items = groups.value.sort(function (item1, item2) {

			var members1 = item1.ZoneGroupMember.sort(sort.asc)
			var members2 = item2.ZoneGroupMember.sort(sort.asc)

			return sort.asc(members1[0], members2[0]);
		});

		var zoneGroupNodes = items.map(function (item, index) {

			if(item.ZoneGroupMember[0].$.IsZoneBridge) {
				return;
			}

			var g = groups.refine(index);
			return (
				<ZoneGroup group={g} currentZone={currentZone} />
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
ZoneGroupList.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
ZoneGroupList.prototype.propTypes = {
	zoneGroups: React.PropTypes.instanceOf(Cursor).isRequired,
	currentZone: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(ZoneGroupList.prototype);