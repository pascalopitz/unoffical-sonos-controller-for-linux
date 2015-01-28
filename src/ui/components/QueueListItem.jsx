import port from '../port';
import model from '../model';

import AlbumArt from './AlbumArt';

import React from 'react/addons';

class QueueListItem {

	render () {

		var track = this.props.data;

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

		port.postMessage({
			type: 'goto',
			host: model.coordinator.host,
			target: this.props.position,
		});

	}
}

QueueListItem.prototype.displayName = "QueueListItem";
export default React.createClass(QueueListItem.prototype);