import QueueListItem from './QueueListItem';

import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

class QueueList extends ImmutableMixin {

	render () {

		var items = this.props.model.refine('items');
		var queueItemNodes;

		if(items.value) {		
			queueItemNodes = items.value.map(function (i, p) {
				var position = p + 1;
				var item = items.refine(p);
				return (
					<QueueListItem item={item} position={position} />
				);
			});
		}

		return (
			<ul id="queue-container">
				{{queueItemNodes}}
			</ul>
		);
	}
}

export default QueueList;