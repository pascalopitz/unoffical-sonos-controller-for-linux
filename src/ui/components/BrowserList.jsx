import _ from 'lodash';

import { h, Component } from 'preact'; //eslint-disable-line
import VirtualList from 'preact-virtual-list';

import BrowserListItem from './BrowserListItem';

import BrowserListActions from '../actions/BrowserListActions';
import BrowserListStore from '../stores/BrowserListStore';

class BrowserList extends Component {

    constructor (props) {
        super(props);

        const state = BrowserListStore.getState();
        const history = BrowserListStore.getHistory();

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
        const state = BrowserListStore.getState();
        const history = BrowserListStore.getHistory();
        const searching = BrowserListStore.isSearching();
        const searchMode = BrowserListStore.getSearchMode();

        this.setState({
            currentState: state,
            history: history,
            searching: searching,
            searchMode: searchMode,
        });

        // SUPER DIRTY HACK
        document.querySelector('#browser-container > .scollcontainer').scrollTop = 0;
    }

    _back() {
        BrowserListActions.back();
    }

    _home() {
        BrowserListActions.home();
    }

    _onScroll(e) {
        const node = e.target;
        const height = node.scrollHeight - node.offsetHeight;

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
        const mode = e.target.getAttribute('data-mode');
        BrowserListActions.changeSearchMode(mode);
    }

    _renderRow(row) {
        return row;
    }

    render () {

        const searching = this.state.searching;
        const searchMode = this.state.searchMode;
        const history = this.state.history;
        const items = this.state.currentState.items || [];
        const title = this.state.currentState.title;

        let headlineNodes;
        let actionNodes;

        const listItemNodes = items.map((item, p) => {
            const position = p + 1;
            return (
                <BrowserListItem key={position} model={item} position={position} />
            );
        });

        if(searching) {
            const links = ["artists", "albums", "tracks"].map((mode) => {

                const className = (mode === searchMode) ? 'active' : 'not-active';

                return (
                    <li key={mode}
                        className={className}
                        onClick={this._searchModeChange.bind(this)}
                        data-mode={mode}>{mode}</li>
                );
            });

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
            const albumState = _.cloneDeep(this.state.currentState);
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
            <div id="music-sources-container" onScrollCapture={this._onScroll.bind(this)}>
                {headlineNodes}
                <ul id="browser-container">
                    <VirtualList
                        rowHeight={50} sync={true} class="scrollcontainer"
                        data={[actionNodes].concat(listItemNodes)}
                        renderRow={this._renderRow.bind(this)}
                        >
                    </VirtualList>
                </ul>
            </div>
        );
    }
}

export default BrowserList;
