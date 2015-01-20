import model from '../model';
import register from '../helpers/registerComponent';

import QueueListItem from './QueueListItem';

class QueueList {

	getInitialState () {
		return {
			items: []
		};
	}

	componentDidMount () {
		var self = this;

		model.observe('queue', function () {
			self.setState({
				items: model.queue.items
			});
		});
	}


	render () {

		var queueItemNodes = this.state.items.map(function (i, p) {
			var position = p + 1;
			return (
				<QueueListItem data={i} position={position} />
			);
		});

		return (
			<ul id="queue-container">
				{{queueItemNodes}}
			</ul>
		);
	}
}

QueueList.prototype.displayName = "QueueList";
export default register(QueueList);