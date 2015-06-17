"use strict";

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
			selected: QueueStore.getSelected(),
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
		this.setState({
			boundingRect : React.findDOMNode(this).getBoundingClientRect(),
			tracks: QueueStore.getTracks(),
			position: QueueStore.getPosition(),
			selected: QueueStore.getSelected(),
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
		let tracks = this.state.tracks;
		let selected = this.state.selected;
		let currentPosition = this.state.position;
		let queueItemNodes;
		let clearNode;

		if(tracks.length) {
			clearNode = (
				<a id="queue-clear-button" onClick={this._onClick.bind(this)}>
					<i className="material-icons">clear_all</i>
				</a>
			);

			queueItemNodes = tracks.map((track, p) => {
				let position = p + 1;
				let isCurrent = position === currentPosition;

				return (
					<QueueListItem track={track}
									position={position}
									selected={selected}
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