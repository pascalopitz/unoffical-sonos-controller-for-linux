"use strict";

import _ from "lodash";
import React from 'react';
import ReactDOM from 'react-dom';

import QueueActions from '../actions/QueueActions';
import QueueStore from '../stores/QueueStore';

import QueueListItem from './QueueListItem';

import { getClosest } from '../helpers/dom-utility';

class QueueList extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			dragging: false,
			tracks: QueueStore.getTracks(),
			position: QueueStore.getPosition(),
		};
	}

	componentDidMount () {
		QueueStore.addChangeListener(this._onChange.bind(this));

		this.setState({
			boundingRect : ReactDOM.findDOMNode(this).getBoundingClientRect()
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
		if(this.state.dragging) {
			return;
		}

		this.setState({
			boundingRect : ReactDOM.findDOMNode(this).getBoundingClientRect(),
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

	_onDragStart (e) {
		this.setState({
			dragPosition: Number(e.target.getAttribute('data-position')),
			dragging: true,
		});
	}

	_onDragEnd (e) {
		let newPos = this.state.dragOverMode === 'after' ? this.state.dragOverPosition + 1 : this.state.dragOverPosition;

		QueueActions.changePosition(this.state.dragPosition, newPos);

		this.setState({
			dragPosition: false,
			dragging: false,
			dragOverPosition: null,
			dragOverMode: null,
		});
	}

	_onDragOver (e) {
		let li = getClosest(e.target, 'li');

		if(li) {
			let rect = li.getBoundingClientRect();
			let midPoint = rect.top + (rect.height / 2);

			let mode = e.clientY > midPoint ? 'after' : 'before';
			let position = Number(li.getAttribute('data-position'));

			if(mode === this.state.dragOverMode && position === this.state.dragOverPosition) {
				return;
			}

			this.setState({
				dragOverPosition: position,
				dragOverMode: mode,
			});
		} else if(this.state.dragOverMode || this.state.dragOverPosition) {
			this.setState({
				dragOverPosition: null,
				dragOverMode: null,
			});
		}
	}

	render () {
		let tracks = this.state.tracks;
		let selectionContext = _.filter(tracks, {selected: true}).length > 0;
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
				let isCurrent = position === this.state.position;
				let isDragging = position === this.state.dragPosition;
				let isDragOver = position === this.state.dragOverPosition;

				return (
					<QueueListItem track={track}
									position={position}
									isCurrent={isCurrent}
									isDragging={isDragging}
									isDragOver={isDragOver}
									dragOverMode={this.state.dragOverMode}
									selectionContext={selectionContext}
									viewport={this.state.boundingRect} />
				);
			});
		}

		return (
			<div id="queue-list-container">
				{clearNode}
				<ul id="queue-container"
					onDragOver={this._onDragOver.bind(this)}
					onDragStart={this._onDragStart.bind(this)}
					onDragEnd={this._onDragEnd.bind(this)}
					onScroll={this._onScroll.bind(this)}>
					{queueItemNodes}
				</ul>
			</div>
		);
	}
}

export default QueueList;
