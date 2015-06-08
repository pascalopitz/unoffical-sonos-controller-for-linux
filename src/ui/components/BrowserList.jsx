import React from 'react/addons';

import BrowserListItem from './BrowserListItem';

import BrowserListActions from '../actions/BrowserListActions';
import BrowserListStore from '../stores/BrowserListStore';

class BrowserList extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			items: [],
			headline: 'Headline',
		};
	}

	render () {

		var self = this;
		var items = this.state.items;
		var headline = this.state.headline;

		// this.trigger('browser:render', this.props.model.value);

		// var items = this.props.model.refine('items');
		// var headline = this.props.model.refine('headline').value;

		var listItemNodes = items.map(function (i, p) {
			var position = p + 1;
			var item = items.refine(p);
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

	_back() {
		// this.trigger('browser:back');
	}

	_onScroll(e) {
		let node = e.target;
		let height = node.scrollHeight - node.offsetHeight;

		if(node.scrollTop + 50 > height) {
			// this.trigger('browser:more');
		}
	}
}

export default BrowserList;