"use strict";

import _ from 'lodash';
import React from 'react/addons';

import sort from '../helpers/sort';
import ZoneGroupActions from '../actions/ZoneGroupActions';

import ZoneGroupMember from './ZoneGroupMember'; 

class ZoneGroup extends React.Component {

	render () {
		let items = this.props.group;

		if(!items) {
			return null;
		}

		let coordinator = _(items).findWhere({
			coordinator: "true"
		});

		let zoneNodes = items.map(function (item, index) {
			return (
				<ZoneGroupMember member={item} />
			);
		});

		let classString = 'not-selected'

		if(this.props.currentZone && coordinator && coordinator.uuid === this.props.currentZone.uuid) {
			classString = 'selected';
		}

		return (
			<ul className={classString} onClick={this._onClick.bind(this)}>
				{{zoneNodes}}

				<div className="group-button" onClick={this._showGroupManagement.bind(this)}>Group</div>
			</ul>
		);
	}

	_onClick () {
		ZoneGroupActions.selectGroup(this.props.group);
	}

	_showGroupManagement (e) {
		ZoneGroupActions.showManagement(this.props.group);
		e.preventDefault();
		e.stopPropagation();
	}
}

export default ZoneGroup;