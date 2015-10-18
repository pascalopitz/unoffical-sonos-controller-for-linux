"use strict";

import React from 'react';

import ZoneGroup from './ZoneGroup';
import ZoneGroupStore from '../stores/ZoneGroupStore';

class ZoneGroupList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			groups: ZoneGroupStore.getAll(),
			playStates: ZoneGroupStore.getPlayStates(),
			current: ZoneGroupStore.getCurrent(),
		};
	}

	componentDidMount() {
		ZoneGroupStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		this.setState({
			groups: ZoneGroupStore.getAll(),
			playStates: ZoneGroupStore.getPlayStates(),
			current: ZoneGroupStore.getCurrent(),
		});
	}

	render () {
		// TODO: SORT PROPERLY
		// let items = this.state.groups.sort((item1, item2) => {
		// 	let members1 = item1.ZoneGroupMember.sort(sort.asc);
		// 	let members2 = item2.ZoneGroupMember.sort(sort.asc);

		// 	return sort.asc(members1[0], members2[0]);
		// });

		let zoneGroupNodes = Object.keys(this.state.groups).map((key) => {
			let item = this.state.groups[key];

			return (
				<ZoneGroup playStates={this.state.playStates} group={item} currentZone={this.state.current} />
			);
		});

		return (
			<div id="zone-wrapper">
				{zoneGroupNodes}
			</div>
		);
	}
}

export default ZoneGroupList;
