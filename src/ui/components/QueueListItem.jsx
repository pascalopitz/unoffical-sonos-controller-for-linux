import React from 'react/addons';

import AlbumArt from './AlbumArt';

import QueueActions from '../actions/QueueActions';

class QueueListItem extends React.Component {

	render () {

		var track = this.props.track;
		var id = this.props.uid || '';

		return (
			<li onDoubleClick={this._onDoubleClick.bind(this)} data-position={this.props.position}>
				<AlbumArt id={id} src={track.albumArtURI} />
				<div className="trackinfo">
					<p className="title">{track.title}</p>
					<p className="artist">{track.creator}</p>
				</div>
			</li>
		);
	}

	_onDoubleClick () {
		QueueActions.gotoPosition(this.props.position);
	}
}

export default QueueListItem;