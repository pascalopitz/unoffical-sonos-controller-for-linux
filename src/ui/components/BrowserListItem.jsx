import React from 'react/addons';

import AlbumArt from './AlbumArt';
import BrowserListActions from '../actions/BrowserListActions';

class BrowserListItem extends React.Component  {

	constructor () {
		super();
		this.state = {
			expanded: false
		};
	}

	_onClick (e) {
		let item = this.props.model;

		if(item.class === 'object.item.audioItem.musicTrack') {
			BrowserListActions.addQueue(item);
		} else {
			let node = React.findDOMNode(this);
			node.parentNode.scrollTop = 0;

			BrowserListActions.select(item);
		}
	}

	_playNow (e) {
		let item = this.props.model;
		BrowserListActions.playNow(item);
		return this._toggle();
	}

	_playNext (e) {
		let item = this.props.model;
		BrowserListActions.playNext(item);
		return this._toggle();
	}

	_addQueue (e) {
		let item = this.props.model;
		BrowserListActions.addQueue(item);
		return this._toggle();
	}

	_replaceQueue (e) {
		let item = this.props.model;
		BrowserListActions.replaceQueue(item);
		return this._toggle();
	}

	_toggle (e) {
		this.setState({
			expanded: !this.state.expanded
		});
		return false;
	}

	_hideMenu (e) {
		if(this.state.expanded) {
			this.setState({
				expanded: false
			});
		}
	}

	_onMouseOut (e) {
		this._hideTimeout = window.setTimeout(this._hideMenu.bind(this), 500);
		return false;
	}

	_onMouseOver (e) {
		if(this._hideTimeout) {
			window.clearTimeout(this._hideTimeout);
		}
		return false;
	}

	render () {
		var item = this.props.model;
		var inlineMenu, inlineMenuButton;
		var className = 'trackinfo';

		var artistInfo;

		if(item.class) {
			className = className + ' playable ' + /\.(\w+)$/gi.exec(item.class)[1];

			inlineMenuButton = (
				<i className="material-icons arrow" onClick={this._toggle.bind(this)}>arrow_drop_down_circle</i>
			);

			if(this.state.expanded) {
				inlineMenu = (
					<ul className="inline-menu"
						onMouseOut={this._onMouseOut.bind(this)}
						onMouseOver={this._onMouseOver.bind(this)}>

						<li onClick={this._playNow.bind(this)}>Play Now</li>
						<li onClick={this._playNext.bind(this)}>Play Next</li>
						<li onClick={this._addQueue.bind(this)}>Add to Queue</li>
						<li onClick={this._replaceQueue.bind(this)}>Replace Queue</li>
					</ul>
				);
			}
		}

		if(item.creator) {
			className += ' with-creator';

			artistInfo = (
				<p className="creator" title={item.creator}>{item.creator}</p>
			);
		}

		return (
			<li onClick={this._onClick.bind(this)}
				onMouseOut={this._onMouseOut.bind(this)}
				onMouseOver={this._onMouseOver.bind(this)}
				data-position={this.props.position}>

				<AlbumArt viewport={this.props.viewport} src={item.albumArtURI} />
				<div className={className}>
					<p className="title" title={item.title}>{item.title}</p>
					{{artistInfo}}
				</div>
				{{inlineMenu}}
				{{inlineMenuButton}}
			</li>
		);
	}
}

export default BrowserListItem;