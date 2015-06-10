import React from 'react/addons';

import AlbumArt from './AlbumArt';
import BrowserListActions from '../actions/BrowserListActions';

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
		let item = this.props.model;

		if(item.class === 'object.item.audioItem.musicTrack') {
			BrowserListActions.play(item);
		} else {
			let node = React.findDOMNode(this);
			node.parentNode.scrollTop = 0;

			BrowserListActions.select(item);
		}
	}
}

export default BrowserListItem;