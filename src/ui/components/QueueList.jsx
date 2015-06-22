"use strict";

import _ from "lodash";
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
				let current = root.querySelector('*[data-is-current=true]');

				if(current) {
					current.scrollIntoViewIfNeeded();
				}
			}, 1000);
		}
	}

	_onChange () {
		this.setState({
			boundingRect : React.findDOMNode(this).getBoundingClientRect(),
			tracks: QueueStore.getTracks(),
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
		let tracks = this.state.tracks;
		let selectionContext = _.filter(tracks, {selected: true}).length > 0;
		let currentPosition = this.state.position;
		let queueItemNodes;
		let clearNode;

		if(tracks.length) {
			clearNode = (
				<a id="queue-clear-button" onClick={this._onClick.bind(this)} title="Clear Queue">
					<i className="material-icons">clear_all</i>
				</a>
			);

			queueItemNodes = tracks.map((track, p) => {
				let position = p + 1;
				let isCurrent = position === currentPosition;

				return (
					<QueueListItem track={track}
									position={position}
									isCurrent={isCurrent}
									selectionContext={selectionContext}
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