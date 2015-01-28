import port from '../port';
import model from '../model';

import AlbumArt from './AlbumArt';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class BrowserListItem {

	render () {

		var track = this.props.data;

		return (
			<li onClick={this._onClick} data-position={this.props.position}>
				<AlbumArt id="" src={track.albumArtURI} />
				<div className="trackinfo">
					<p className="title">{track.title}</p>
					<p className="artist">{track.creator}</p>
				</div>
			</li>
		);
	}

	_onClick (e) {

		this.props.clickAction(e, this.props.data);

	}
}

BrowserListItem.prototype.displayName = "BrowserListItem";
BrowserListItem.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
export default React.createClass(BrowserListItem.prototype);