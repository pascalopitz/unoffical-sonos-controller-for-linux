
import BrowserListItem from './BrowserListItem';

import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

var history = [];

class BrowserList extends ImmutableMixin {

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
				<h4><a onClick={this._back.bind(this)}>{headline}</a></h4>
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

BrowserList.propTypes = {
	model: React.PropTypes.instanceOf(Cursor).isRequired
};
export default BrowserList;