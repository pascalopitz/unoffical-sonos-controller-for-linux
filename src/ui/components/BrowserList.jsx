import _ from 'lodash';

import { h, Component } from 'preact'; //eslint-disable-line
import ScrollViewPort from './ScrollViewPort';

import BrowserListItem from './BrowserListItem';

import BrowserListActions from '../actions/BrowserListActions';
import BrowserListStore from '../stores/BrowserListStore';

class BrowserList extends Component {

	constructor (props) {
		super(props);

		let state = BrowserListStore.getState();
		let history = BrowserListStore.getHistory();

		this.state = {
			currentState: state,
			history: history,
			searching: false,
			searchMode: null,
			boundingRect: {},
		};

		this.moreHandler = _.throttle(() => {
			BrowserListActions.more(this.state.currentState);
		}, 1000);
	}

	componentDidMount() {
		BrowserListStore.addChangeListener(this._onChange.bind(this));

		this.setState({

		});
	}

	_onChange() {
		let state = BrowserListStore.getState();
		let history = BrowserListStore.getHistory();
		let searching = BrowserListStore.isSearching();
		let searchMode = BrowserListStore.getSearchMode();

		this.setState({
			currentState: state,
			history: history,
			searching: searching,
			searchMode: searchMode,
		});
	}

	_back() {
		BrowserListActions.back();
	}

	_home() {
		BrowserListActions.home();
	}

	_onScroll(e) {
		let node = e.target;
		let height = node.scrollHeight - node.offsetHeight;

		// HACK: this happens when we press the back button for some reason
		if(height === -1) {
			return;
		}

		if(node.scrollTop + 50 > height) {
			this.moreHandler();
		}
	}

	_playAlbum (e) {
		BrowserListActions.play(this.state.currentState);
	}

	_searchModeChange (e) {
		let mode = e.target.getAttribute('data-mode');
		BrowserListActions.changeSearchMode(mode);
	}

	render () {

		let searching = this.state.searching;
		let searchMode = this.state.searchMode;
		let history = this.state.history;
		let items = this.state.currentState.items || [];
		let title = this.state.currentState.title;

		let headlineNodes;
		let actionNodes;

		let listItemNodes = items.map((item, p) => {
			let position = p + 1;
			return (
				<BrowserListItem key={position} model={item} position={position} />
			);
		});

		if(searching) {
			let links = ["artists", "albums", "tracks"].map((mode) => {

				let className = (mode === searchMode) ? 'active' : 'not-active';

				return (
					<li key={mode}
						className={className}
						onClick={this._searchModeChange.bind(this)}
						data-mode={mode}>{mode}</li>
				);
			})

			headlineNodes = (
				<ul className="with-search">
					{links}
				</ul>
			);
		} else if(history.length) {
			headlineNodes = (
				<h4 className="with-history">
					<a onClick={this._back.bind(this)} className="back-arrow" title="back">
						<i className="material-icons">keyboard_arrow_left</i>
					</a>
					<a onClick={this._home.bind(this)} className="home-button" title="home">
						<i className="material-icons">library_music</i>
					</a>
					<span>{title}</span>
				</h4>
			);
		} else {
			headlineNodes = <h4>{title}</h4>;
		}

		if(
			this.state.currentState.class === 'object.container.album.musicAlbum'
			|| this.state.currentState.class === 'object.container.playlistContainer'
			|| JSON.parse(String(_.get(this, 'state.currentState.parent.canPlay') || 'false'))
		) {
			let albumState = _.cloneDeep(this.state.currentState);
			albumState.creator = null;
			albumState.title = `${items.length} Tracks`;

			if(_.get(albumState, 'parent.serviceClient')) {
				albumState.serviceClient = this.state.currentState.serviceClient;
				albumState.parent.serviceClient = this.state.currentState.parent.serviceClient;
			}

			actionNodes = (
				<BrowserListItem model={albumState} />
			);
		}

		return (
			<div id="music-sources-container" onScroll={this._onScroll.bind(this)}>
				{headlineNodes}
				<ul id="browser-container">
					<ScrollViewPort rowHeight={50} sync={true} class="scrollcontainer" scroll="#browser-container">
					{actionNodes}
					{listItemNodes}
					</ScrollViewPort>
				</ul>
			</div>
		);
	}
}

export default BrowserList;
