import AlbumArt from './AlbumArt';

import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from './mixins/ImmutableMixin';

class BrowserListItem extends ImmutableMixin {

	render () {

		var track = this.props.model.value;

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
		this.trigger('browser:action', this.props.model.value);
	}
}

BrowserListItem.propTypes = {
	model: React.PropTypes.instanceOf(Cursor).isRequired
};
export default BrowserListItem;