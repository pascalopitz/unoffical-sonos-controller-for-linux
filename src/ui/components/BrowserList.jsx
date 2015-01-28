
import port from '../port';
import model from '../model';

import BrowserListItem from './BrowserListItem';

import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

var initialState = {
	source: null,
	searchType: null,
	headline: 'Select a Music Source',
	items: [
		{
			title: 'Sonos Favourites',
			source: 'favourites'
		},
		{
			title: 'Music Library',
			source: 'library'
		}
	]
};

var librarySearch= {
	headline: 'Browse Music Library',
	source: 'library',
	items: [
		{
			title: 'Artists',
			searchType: 'artists'
		},
		{
			title: 'Albums',
			searchType: 'albums'
		},
		{
			title: 'Composers',
			searchType: 'composers'
		},
		{
			title: 'Genres',
			searchType: 'genres'
		},
		{
			title: 'Tracks',
			searchType: 'tracks'
		},
		{
			title: 'Playlists',
			searchType: 'playlists'
		}
	]
};

var rewinds = [];


class BrowserList {

	getInitialState () {
		rewinds.push(initialState);
		return initialState;	
	}

	render () {

		var self = this;
		var clickAction

		var listItemNodes = this.state.items.map(function (i, p) {
			var position = p + 1;
			return (
				<BrowserListItem data={i} position={position} clickAction={self._clickAction} />
			);
		});

		return (
			<div id="music-sources-container">
				<h4>{this.state.headline}</h4>
				<ul id="browser-container">
					{{listItemNodes}}
				</ul>
			</div>
		);
	}

	_clickAction (e, item) {
		console.log(item);

		if(!this.state.source) {
			if(item.source === 'library') {
				this.setState(librarySearch);
				rewinds.push(this.state);
			} else {
				this.setState(initialState);
			}			
		}

		if(this.state.source === 'library' && item.searchType) {
			console.log('here', item);

			port.postMessage({
				type: 'browse',
				host: model.coordinator.host,
				searchType: item.searchType,
			});
		}
	}
}

BrowserList.prototype.displayName = "BrowserList";
BrowserList.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
export default React.createClass(BrowserList.prototype);