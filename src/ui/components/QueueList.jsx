import React from 'react/addons';

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

	render () {

		var tracks = this.state.tracks;
		var queueItemNodes;

		if(tracks.length) {
			queueItemNodes = tracks.map((track, p) => {
				var position = p + 1;
				return (
					<QueueListItem track={track} position={position} />
				);
			});
		}

		return (
			<ul id="queue-container">
				{{queueItemNodes}}
			</ul>
		);
	}
}

export default QueueList;