import QueueListItem from './QueueListItem';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class QueueList {

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

QueueList.prototype.displayName = "QueueList";
QueueList.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
export default React.createClass(QueueList.prototype);