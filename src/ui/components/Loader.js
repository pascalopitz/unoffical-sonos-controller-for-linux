import React from 'react/addons';
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

		let msg = "Looking for Sonos Players ...";

		return (
			<div id="loader">
				<p>{msg}</p>
			</div>
		);
	}
}

export default Loader;