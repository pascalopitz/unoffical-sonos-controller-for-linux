import React from 'react/addons';

import AlbumArt from './AlbumArt';

class BrowserListItem extends React.Component  {

	render () {

		var track = this.props.model;

		return (
			<li onClick={this._onClick.bind(this)} data-position={this.props.position}>
				<AlbumArt id="" src={track.albumArtURI} />
				<div className="trackinfo">
					<p className="title">{track.title}</p>
					<p className="artist">{track.creator}</p>
				</div>
			</li>
		);
	}

	_onClick (e) {
		// this.trigger('browser:action', this.props.model.value);
	}
}

export default BrowserListItem;