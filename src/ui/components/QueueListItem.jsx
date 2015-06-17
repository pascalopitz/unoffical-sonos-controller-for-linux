"use strict";

import _ from 'lodash';

import React from 'react/addons';
import AlbumArt from './AlbumArt';

import QueueActions from '../actions/QueueActions';

class QueueListItem extends React.Component {

	constructor () {
		super();
		this.state = {
			isExpanded: false,
		};
	}

	_isSelected () {
		var selected = this.props.selected;
		var track = this.props.track;

		return _.filter(selected, _.matches(track)).length > 0;
	}

	_hideMenu (e) {
		if(this.state.isExpanded) {
			this.setState({
				isExpanded: false
			});
		}
	}

	_toggle (e) {
		this.setState({
			isExpanded: !this.state.isExpanded
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

	_removeSelected (e) {
		QueueActions.removeSelected();
		this._toggle(e);
	}

	_toggleSelection (e) {
		var isSelected = this._isSelected();

		if(!isSelected) {
			QueueActions.select(this.props.track);
		} else {
			QueueActions.deselect(this.props.track);
		}

		e.preventDefault();
		e.stopPropagation();
	}

	render () {
		var inlineMenuButton;
		var inlineMenu;
		var selectionToggle;

		var isCurrent = this.props.isCurrent;
		var selected = this.props.selected;
		var track = this.props.track;

		var selectionContext = selected.length > 0;
		var isSelected = this._isSelected();

		var id = this.props.uid || '';

		var checkboxSymbol = isSelected ? 'check_box' : 'check_box_outline_blank';

		inlineMenuButton = (
			<i className="material-icons arrow"
				onClick={this._toggle.bind(this)}>arrow_drop_down_circle</i>
		);

		selectionToggle = (
			<i className="material-icons checkbox"
				onClick={this._toggleSelection.bind(this)}>{checkboxSymbol}</i>
		);

		if(this.state.isExpanded) {
			if(selectionContext) {
				inlineMenu = (
					<ul className="inline-menu"
						onMouseOut={this._onMouseOut.bind(this)}
						onMouseOver={this._onMouseOver.bind(this)}>

						<li onClick={this._playNow.bind(this)}>Play Track</li>
						<li onClick={this._removeSelected.bind(this)}>Remove Selected Track(s)</li>
					</ul>
				);
			} else {
				inlineMenu = (
					<ul className="inline-menu"
						onMouseOut={this._onMouseOut.bind(this)}
						onMouseOver={this._onMouseOver.bind(this)}>

						<li onClick={this._playNow.bind(this)}>Play Track</li>
						<li onClick={this._removeTrack.bind(this)}>Remove Track</li>
					</ul>
				);
			}
		}

		return (
			<li onDoubleClick={this._playNow.bind(this)}
				onMouseOut={this._onMouseOut.bind(this)}
				onMouseOver={this._onMouseOver.bind(this)}
				data-position={this.props.position}
				data-is-selected={isSelected} 
				data-is-current={this.props.isCurrent}>

				<AlbumArt id={id} src={track.albumArtURI} viewport={this.props.viewport} />
				<div className="trackinfo">
					<p className="title">{track.title}</p>
					<p className="artist">{track.creator}</p>
				</div>
				{{selectionToggle}}
				{{inlineMenu}}
				{{inlineMenuButton}}
			</li>
		);
	}
}

export default QueueListItem;