import React from 'react/addons';

import BrowserListItem from './BrowserListItem';

import BrowserListActions from '../actions/BrowserListActions';
import BrowserListStore from '../stores/BrowserListStore';

class BrowserList extends React.Component {

	constructor (props) {
		super(props);
		this.state = BrowserListStore.getState();
	}

	componentDidMount() {
		BrowserListStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		let state = BrowserListStore.getState();
		this.setState(state);
	}

	_back() {
		BrowserListActions.back();
	}

	_onScroll(e) {
		let node = e.target;
		let height = node.scrollHeight - node.offsetHeight;

		if(node.scrollTop + 50 > height) {
			BrowserListActions.more(this.state);
		}
	}

	render () {

		var items = this.state.items;
		var headline = this.state.headline;

		var listItemNodes = items.map((item, p) => {
			var position = p + 1;
			return (
				<BrowserListItem model={item} position={position} />
			);
		});

		return (
			<div id="music-sources-container" onScroll={this._onScroll.bind(this)}>
				<h4><a onClick={this._back.bind(this)}>{headline}</a></h4>
				<ul id="browser-container">
					{{listItemNodes}}
				</ul>
			</div>
		);
	}
}

export default BrowserList;