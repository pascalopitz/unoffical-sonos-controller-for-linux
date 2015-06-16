import React from 'react/addons';

import AlbumArt from './AlbumArt';

import QueueActions from '../actions/QueueActions';

class QueueListItem extends React.Component {

	constructor () {
		super();
		this.state = {
			expanded: false
		};
	}

	_hideMenu (e) {
		if(this.state.expanded) {
			this.setState({
				expanded: false
			});
		}
	}

	_toggle (e) {
		this.setState({
			expanded: !this.state.expanded
		});
		e.preventDefault();
		e.stopPropagation();
	}

	_onMouseOut (e) {
		this._hideTimeout = window.setTimeout(this._hideMenu.bind(this), 500);
		e.preventDefault();
		e.stopPropagation();
	}

	_onMouseOver (e) {
		if(this._hideTimeout) {
			window.clearTimeout(this._hideTimeout);
		}
		e.preventDefault();
		e.stopPropagation();
	}

	_playNow (e) {
		QueueActions.gotoPosition(this.props.position);
		this._toggle(e);
	}

	_removeTrack (e) {
		QueueActions.removeTrack(this.props.position);
		this._toggle(e);
	}

	render () {
		var inlineMenuButton;
		var inlineMenu;

		var isCurrent = this.props.isCurrent;
		var track = this.props.track;
		var id = this.props.uid || '';

		inlineMenuButton = (
			<i className="material-icons arrow" onClick={this._toggle.bind(this)}>arrow_drop_down_circle</i>
		);

		if(this.state.expanded) {
			inlineMenu = (
				<ul className="inline-menu"
					onMouseOut={this._onMouseOut.bind(this)}
					onMouseOver={this._onMouseOver.bind(this)}>

					<li onClick={this._playNow.bind(this)}>Play Track</li>
					<li onClick={this._removeTrack.bind(this)}>Remove Track</li>
				</ul>
			);
		}

		return (
			<li onDoubleClick={this._playNow.bind(this)}
				onMouseOut={this._onMouseOut.bind(this)}
				onMouseOver={this._onMouseOver.bind(this)}
				data-position={this.props.position} 
				data-is-current={this.props.isCurrent}>

				<AlbumArt id={id} src={track.albumArtURI} viewport={this.props.viewport} />
				<div className="trackinfo">
					<p className="title">{track.title}</p>
					<p className="artist">{track.creator}</p>
				</div>
				{{inlineMenu}}
				{{inlineMenuButton}}
			</li>
		);
	}
}

export default QueueListItem;