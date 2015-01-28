import model from '../model';
import ZoneGroupMember from './ZoneGroupMember'; 

import React from 'react/addons';

class ZoneGroup {

	componentDidMount () {
		var self = this;

		model.observe('currentZone', function () {
			self.forceUpdate();
		});
	}

	componentWillUnmount () {
		// unsubscribe
	}

	render () {

		var zoneNodes = this.props.data.ZoneGroupMember.map(function (z) {
			return (
				<ZoneGroupMember data={z.$} />
			);
		});

		var classString = 'not-selected'

		if(model.currentZone.$.ID === this.props.data.$.ID) {
			classString = 'selected';
		}

			return (
				<ul className={classString} onClick={this._onClick}>
					{{zoneNodes}}
				</ul>
		);
	}

	_onClick () {
		model.currentZone = this.props.data;
	}
}

ZoneGroup.prototype.displayName = "ZoneGroup";
export default React.createClass(ZoneGroup.prototype);