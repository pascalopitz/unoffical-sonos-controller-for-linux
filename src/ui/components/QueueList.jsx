import React from 'react/addons';

import QueueActions from '../actions/QueueActions';
import QueueStore from '../stores/QueueStore';

import QueueListItem from './QueueListItem';

class QueueList extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			tracks: QueueStore.getTracks(),
			position: QueueStore.getPosition(),
		};
	}

	componentDidMount () {
		QueueStore.addChangeListener(this._onChange.bind(this));

		this.setState({
			boundingRect : React.findDOMNode(this).getBoundingClientRect()
		});
	}

	componentWillUpdate (nextProps, nextState) {
		if(nextState.position && nextState.position !== this.state.position) {
			window.setTimeout(() => {
				let current = root.querySelector('*[data-is-current=true]').scrollIntoViewIfNeeded();
			}, 1000);
		}
	}

	_onChange () {
		let tracks = QueueStore.getTracks();

		this.setState({
			boundingRect : React.findDOMNode(this).getBoundingClientRect(),
			tracks: tracks,
			position: QueueStore.getPosition(),
		});
	}

	_onClick () {
		QueueActions.flush();
	}

	_onScroll (e) {
		let node = e.target;

		this.setState({
			boundingRect : node.getBoundingClientRect()
		});
	}

	render () {

		var tracks = this.state.tracks;
		var currentPosition = this.state.position;
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
				var isCurrent = position === currentPosition;

				return (
					<QueueListItem track={track}
									position={position}
									isCurrent={isCurrent}
									viewport={this.state.boundingRect} />
				);
			});
		}

		return (
			<div id="queue-list-container">
				{{clearNode}}
				<ul id="queue-container" onScroll={this._onScroll.bind(this)}>
					{{queueItemNodes}}
				</ul>
			</div>
		);
	}
}

export default QueueList;