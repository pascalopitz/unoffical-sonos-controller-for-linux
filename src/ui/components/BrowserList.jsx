import _ from 'lodash';

import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import VirtualList from 'preact-virtual-list';

import BrowserListItem from './BrowserListItem';

import {
    getCurrentState,
    getSearching,
    getHistory,
    getSearchMode,
    getServiceItems
} from '../selectors/BrowserListSelectors';

import {
    home,
    back,
    more,
    changeSearchMode,
    playCurrentAlbum
} from '../reduxActions/BrowserListActions';

const mapStateToProps = state => {
    return {
        currentState: getCurrentState(state),
        serviceItems: getServiceItems(state),
        searching: getSearching(state),
        history: getHistory(state),
        searchMode: getSearchMode(state)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        home: () => dispatch(home()),
        back: () => dispatch(back()),
        more: currentState => dispatch(more(currentState)),
        changeSearchMode: mode => dispatch(changeSearchMode(mode)),
        playCurrentAlbum: () => dispatch(playCurrentAlbum())
    };
};

export class BrowserList extends Component {
    constructor(props) {
        super(props);

        this.moreHandler = _.throttle(() => {
            this.props.more(this.props.currentState);
        }, 1000);
    }

    _back() {
        this.props.back();
    }

    _home() {
        this.props.home();
    }

    _onScroll(e) {
        const node = e.target;
        const height = node.scrollHeight - node.offsetHeight;

        // HACK: this happens when we press the back button for some reason
        if (height === -1) {
            return;
        }

        if (node.scrollTop + 50 > height) {
            this.moreHandler();
        }
    }

    _playAlbum() {
        this.playCurrentAlbum();
    }

    _searchModeChange(e) {
        const mode = e.target.getAttribute('data-mode');
        this.props.changeSearchMode(mode);
    }

    _renderRow(row) {
        return row;
    }

    render() {
        const {
            searching,
            searchMode,
            currentState,
            history,
            serviceItems
        } = this.props;
        const { items, title, source } = currentState;

        let headlineNodes;
        let actionNodes;

        const displayItems =
            source === 'start' ? items.concat(serviceItems) : items;

        const listItemNodes = _.map(
            _.reject(displayItems, i => !i),
            (item, p) => {
                const position = p + 1;
                return (
                    <BrowserListItem
                        key={item.id}
                        model={item}
                        position={position}
                    />
                );
            }
        );

        if (searching) {
            const links = ['artists', 'albums', 'tracks'].map(mode => {
                const className = mode === searchMode ? 'active' : 'not-active';

                return (
                    <li
                        key={mode}
                        className={className}
                        onClick={this._searchModeChange.bind(this)}
                        data-mode={mode}
                    >
                        {mode}
                    </li>
                );
            });

            headlineNodes = (
                <ul className="with-search">
                    {links}
                </ul>
            );
        } else if (history.length && source !== 'start') {
            headlineNodes = (
                <h4 className="with-history">
                    <a
                        onClick={this._back.bind(this)}
                        className="back-arrow"
                        title="back"
                    >
                        <i className="material-icons">keyboard_arrow_left</i>
                    </a>
                    <a
                        onClick={this._home.bind(this)}
                        className="home-button"
                        title="home"
                    >
                        <i className="material-icons">library_music</i>
                    </a>
                    <span>
                        {title}
                    </span>
                </h4>
            );
        } else {
            headlineNodes = (
                <h4>
                    {title}
                </h4>
            );
        }

        if (
            this.props.currentState.class ===
                'object.container.album.musicAlbum' ||
            this.props.currentState.class ===
                'object.container.playlistContainer' ||
            JSON.parse(
                String(
                    _.get(this, 'state.currentState.parent.canPlay') || 'false'
                )
            )
        ) {
            const albumState = _.cloneDeep(this.props.currentState);
            albumState.creator = null;
            albumState.title = `${items.length} Tracks`;

            if (_.get(albumState, 'parent.serviceClient')) {
                albumState.serviceClient = this.props.currentState.serviceClient;
                albumState.parent.serviceClient = this.props.currentState.parent.serviceClient;
            }

            actionNodes = <BrowserListItem model={albumState} />;
        }

        return (
            <div
                id="music-sources-container"
                onScrollCapture={this._onScroll.bind(this)}
            >
                {headlineNodes}
                <ul id="browser-container">
                    <VirtualList
                        rowHeight={50}
                        sync={true}
                        class="scrollcontainer"
                        data={[actionNodes].concat(listItemNodes)}
                        renderRow={this._renderRow.bind(this)}
                    />
                </ul>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserList);
