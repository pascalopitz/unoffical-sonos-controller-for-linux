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
		};
	}

	componentDidMount() {
		BrowserListStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		let state = BrowserListStore.getState();
		let history = BrowserListStore.getHistory();

		this.setState({
			currentState: state,
			history: history,
		});
	}

	_back() {
		BrowserListActions.back();
	}

	_onScroll(e) {
		let node = e.target;
		let height = node.scrollHeight - node.offsetHeight;

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

	render () {

		var history = this.state.history;
		var items = this.state.currentState.items;
		var title = this.state.currentState.title;

		var headlineNodes;
		var actionNodes;

		var listItemNodes = items.map((item, p) => {
			var position = p + 1;
			return (
				<BrowserListItem model={item} position={position} />
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