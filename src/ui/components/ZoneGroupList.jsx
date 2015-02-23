import ZoneGroup from './ZoneGroup'; 

import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

import sort from '../helpers/sort';

class ZoneGroupList extends ImmutableMixin {

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

ZoneGroupList.propTypes = {
	zoneGroups: React.PropTypes.instanceOf(Cursor).isRequired,
	currentZone: React.PropTypes.instanceOf(Cursor).isRequired
};
export default ZoneGroupList;