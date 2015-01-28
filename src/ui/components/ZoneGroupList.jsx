import model from '../model';
import ZoneGroup from './ZoneGroup'; 

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class ZoneGroupList {

	render () {
		var groups = this.props.zoneGroups;
		var currentZone = this.props.currentZone;

		var zoneGroupNodes = groups.value.map(function (item, index) {
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