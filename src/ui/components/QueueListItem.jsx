import register from '../helpers/registerComponent';
import port from '../port';
import model from '../model';

import AlbumArt from './AlbumArt';

class QueueListItem {

	render () {

		var track = this.props.data;

		return (
			<li onDoubleClick={this._onDoubleClick}>
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
			type: 'play',
			host: model.coordinator.host,
			item: this.props.data,
		});

	}
}

QueueListItem.prototype.displayName = "QueueListItem";
export default register(QueueListItem);