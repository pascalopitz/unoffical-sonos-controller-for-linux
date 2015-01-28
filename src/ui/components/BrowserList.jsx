
import port from '../port';
import model from '../model';

import BrowserListItem from './BrowserListItem';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

var history = [];

class BrowserList {

	render () {

		var self = this;

		console.log(this.props.model.value);
		history.push(this.props.model.value);

		var items = this.props.model.refine('items');
		var headline = this.props.model.refine('headline').value;

		var listItemNodes = items.value.map(function (i, p) {
			var position = p + 1;
			var item = items.refine(p);
			return (
				<BrowserListItem model={item} position={position} />
			);
		});

		return (
			<div id="music-sources-container">
				<h4><a onClick={this._back}>{headline}</a></h4>
				<ul id="browser-container">
					{{listItemNodes}}
				</ul>
			</div>
		);
	}

	_back() {
		var state = history.pop();
		console.log('back', state);
		this.props.model.set(state);
	}
}

BrowserList.prototype.displayName = "BrowserList";
BrowserList.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
BrowserList.prototype.propTypes = {
	model: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(BrowserList.prototype);