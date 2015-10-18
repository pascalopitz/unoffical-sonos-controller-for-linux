"use strict";

import React from 'react';
import ZoneGroupStore from '../stores/ZoneGroupStore';

class Loader extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			current: ZoneGroupStore.getCurrent(),
		};
	}

	componentDidMount() {
		ZoneGroupStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		this.setState({
			current: ZoneGroupStore.getCurrent(),
		});
	}

	render () {
		if(this.state.current) {
			return null;
		}

		let msg = "Searching for your Sonos System ...";

		return (
			<div id="loader">
				<p>{msg}</p>
			</div>
		);
	}
}

export default Loader;