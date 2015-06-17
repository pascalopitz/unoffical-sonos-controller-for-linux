"use strict";

import _ from 'lodash';

import React from 'react/addons';

import BrowserListItem from './BrowserListItem';

import BrowserListActions from '../actions/BrowserListActions';
import BrowserListStore from '../stores/BrowserListStore';

class BrowserList extends React.Component {

	constructor (props) {
		super(props);

		let state = BrowserListStore.getState();
		let history = BrowserListStore.getHistory();

		this.state = {
			currentState: state,
			history: history,
			searching: false,
			searchMode: null,
			boundingRect: {},
		};
	}

	componentDidMount() {
		BrowserListStore.addChangeListener(this._onChange.bind(this));

		this.setState({
			boundingRect : React.findDOMNode(this).getBoundingClientRect()
		});
	}

	_onChange() {
		let state = BrowserListStore.getState();
		let history = BrowserListStore.getHistory();
		let searching = BrowserListStore.isSearching();
		let searchMode = BrowserListStore.getSearchMode();

		this.setState({
			currentState: state,
			history: history,
			searching: searching,
			searchMode: searchMode,
			boundingRect : React.findDOMNode(this).getBoundingClientRect(),
		});
	}

	_back() {
		BrowserListActions.back();
	}

	_onScroll(e) {
		let node = e.target;
		let height = node.scrollHeight - node.offsetHeight;

		this.setState({
			boundingRect : node.getBoundingClientRect()
		});

		// HACK: this happens when we press the back button for some reason
		if(height === -1) {
			return;
		}

		if(node.scrollTop + 50 > height) {
			let more = _.throttle(() => {
				BrowserListActions.more(this.state.currentState);
			}, 1000);
			more();
		}
	}

	_playAlbum (e) {
		BrowserListActions.play(this.state.currentState);
	}

	_searchModeChange (e) {
		let mode = e.target.getAttribute('data-mode');
		BrowserListActions.changeSearchMode(mode);
	}

	render () {

		var searching = this.state.searching;
		var searchMode = this.state.searchMode;
		var history = this.state.history;
		var items = this.state.currentState.items || [];
		var title = this.state.currentState.title;

		var headlineNodes;
		var actionNodes;

		var listItemNodes = items.map((item, p) => {
			var position = p + 1;
			return (
				<BrowserListItem model={item} position={position} viewport={this.state.boundingRect} />
			);
		});

		if(history.length) {
			headlineNodes = (
				<h4 className="with-history">
					<a onClick={this._back.bind(this)} className="back-arrow">
						<i className="material-icons">keyboard_arrow_left</i>
					</a>
					<span>{title}</span>
				</h4>
			);
		} else if(searching) {
			let links = ["artists", "albums", "tracks"].map((mode) => {

				let className = (mode === searchMode) ? 'active' : 'not-active';

				return (
					<li className={className}
						onClick={this._searchModeChange.bind(this)} 
						data-mode={mode}>{mode}</li>
				);
			})

			headlineNodes = (
				<ul className="with-search">
					{{links}}
				</ul>
			);
		} else {
			headlineNodes = <h4>{title}</h4>;
		}

		if(this.state.currentState.class === 'object.container.album.musicAlbum') {
			actionNodes = (
				<li onClick={this._playAlbum.bind(this)} className="top-action">
					<i className="material-icons">playlist_add</i>
					<p>
						Queue Album
					</p>
				</li>
			);
		}

		return (
			<div id="music-sources-container" onScroll={this._onScroll.bind(this)}>
				{{headlineNodes}}
				<ul id="browser-container">
					{{actionNodes}}
					{{listItemNodes}}
				</ul>
			</div>
		);
	}
}

export default BrowserList;