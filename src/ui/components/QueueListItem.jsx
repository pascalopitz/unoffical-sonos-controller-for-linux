import AlbumArt from './AlbumArt';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class QueueListItem {

	render () {

		var track = this.props.item.value;

		return (
			<li onDoubleClick={this._onDoubleClick} data-position={this.props.position}>
				<AlbumArt id="" src={track.albumArtURI} />
				<div className="trackinfo">
					<p className="title">{track.title}</p>
					<p className="artist">{track.creator}</p>
				</div>
			</li>
		);
	}

	_onDoubleClick () {
		this.trigger('queuelist:goto', this.props.position);
	}
}

QueueListItem.prototype.displayName = "QueueListItem";
QueueListItem.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
QueueListItem.prototype.propTypes = {
	item: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(QueueListItem.prototype);