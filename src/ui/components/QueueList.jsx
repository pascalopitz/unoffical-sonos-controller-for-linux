import React from 'react/addons';

import QueueActions from '../actions/QueueActions';
import QueueStore from '../stores/QueueStore';

import QueueListItem from './QueueListItem';

class QueueList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tracks: QueueStore.getTracks(),
		};
	}

	componentDidMount() {
		QueueStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		let tracks = QueueStore.getTracks();

		this.setState({
			tracks: tracks,
		});
	}

	_onClick () {
		QueueActions.flush();
	}

	render () {

		var tracks = this.state.tracks;
		var queueItemNodes;
		var clearNode;

		if(tracks.length) {
			clearNode = (
				<a id="queue-clear-button" onClick={this._onClick.bind(this)}>
					<i className="material-icons">clear_all</i>
				</a>
			);

			queueItemNodes = tracks.map((track, p) => {
				var position = p + 1;
				return (
					<QueueListItem track={track} position={position} />
				);
			});
		}

		return (
			<div id="queue-list-container">
				{{clearNode}}
				<ul id="queue-container">
					{{queueItemNodes}}
				</ul>
			</div>
		);
	}
}

export default QueueList;