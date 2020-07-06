import _ from 'lodash';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import AutoSizer from 'react-virtualized-auto-sizer';
import VirtualList from 'react-tiny-virtual-list';

import BrowserListItem from './BrowserListItem';

import {
    getCurrentState,
    getSearching,
    getHistory,
    getSearchMode,
    getServiceItems,
    getAvailableSearchModes,
} from '../selectors/BrowserListSelectors';

import {
    home,
    back,
    more,
    search,
    scroll,
    playCurrentAlbum,
} from '../reduxActions/BrowserListActions';

const mapStateToProps = (state) => {
    return {
        term: state.browserList.searchTerm,
        currentState: getCurrentState(state),
        serviceItems: getServiceItems(state),
        searching: getSearching(state),
        history: getHistory(state),
        currentSearchMode: getSearchMode(state),
        searchModes: getAvailableSearchModes(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        scroll: (position) => dispatch(scroll(position)),
        home: () => dispatch(home()),
        back: () => dispatch(back()),
        more: (currentState) => dispatch(more(currentState)),
        search: (term, mode) => dispatch(search(term, mode)),
        playCurrentAlbum: () => dispatch(playCurrentAlbum()),
    };
};

export class BrowserList extends Component {
    constructor(props) {
        super(props);

        this.scrollRef = React.createRef();

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

    UNSAFE_componentWillReceiveProps({ history, currentState }) {
        const elem = this.scrollRef.current.rootNode;

        if (
            history.length === this.props.history.length - 1 &&
            currentState.scrollPosition
        ) {
            window.setTimeout(() => {
                elem.scrollTop = currentState.scrollPosition;
            }, 10);
        } else if (history.length !== this.props.history.length) {
            elem.scrollTop = 0;
        }
    }

    _onScroll(e) {
        const node = e.target;
        const height = node.scrollHeight - node.offsetHeight;

        // HACK: this happens when we press the back button for some reason
        if (height === -1 || node.scrollTop === 0) {
            return;
        }

        this.props.scroll(node.scrollTop);

        if (node.scrollTop + 50 > height) {
            this.moreHandler();
        }
    }

    _playAlbum() {
        this.playCurrentAlbum();
    }

    _searchModeChange(e) {
        const mode = e.target.getAttribute('data-mode');
        this.props.search(this.props.term, mode);
    }

    render() {
        const {
            searching,
            currentSearchMode,
            currentState,
            history,
            serviceItems,
            searchModes,
        } = this.props;
        const { items, title, source } = currentState;

        let headlineNodes;

        const displayItems =
            (source === 'start' ? [...items, ...serviceItems] : items) || [];

        if (searching) {
            const links = searchModes
                .map((m) => m.id)
                .map((mode) => {
                    const className =
                        mode === currentSearchMode ? 'active' : 'not-active';

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

            headlineNodes = <ul className="with-search">{links}</ul>;
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
                    <span>{title}</span>
                </h4>
            );
        } else {
            headlineNodes = <h4>{title}</h4>;
        }

        return (
            <div id="music-sources-container">
                {headlineNodes}
                <ul id="browser-container">
                    <AutoSizer>
                        {({ height, width }) => (
                            <VirtualList
                                className="scrollcontainer"
                                height={height}
                                width={width}
                                itemSize={53}
                                itemCount={displayItems.length}
                                onScrollCapture={this._onScroll.bind(this)}
                                ref={this.scrollRef}
                                renderItem={({ index, style }) => {
                                    const position = index + 1;
                                    const item = displayItems[index];
                                    return (
                                        <BrowserListItem
                                            style={style}
                                            key={`${
                                                item.id || 'position'
                                            }-${position}`}
                                            model={item}
                                            position={position}
                                        />
                                    );
                                }}
                            />
                        )}
                    </AutoSizer>
                </ul>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserList);
