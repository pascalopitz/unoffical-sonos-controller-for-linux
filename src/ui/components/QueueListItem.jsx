import React from 'react/addons';

import AlbumArt from './AlbumArt';

import QueueActions from '../actions/QueueActions';

class QueueListItem extends React.Component {

	render () {

		var isCurrent = this.props.isCurrent;
		var track = this.props.track;
		var id = this.props.uid || '';

		return (
			<li onDoubleClick={this._onDoubleClick.bind(this)}
				data-position={this.props.position} 
				data-is-current={this.props.isCurrent}>

				<AlbumArt id={id} src={track.albumArtURI} viewport={this.props.viewport} />
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