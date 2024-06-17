import debounce from 'lodash/debounce';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';

import AutoSizer from 'react-virtualized-auto-sizer';
import VirtualList from 'react-tiny-virtual-list';

import BrowserListItem from './BrowserListItem';

const {
    getCurrentState,
    getSearching,
    getHistory,
    getSearchMode,
    getServiceItems,
    getAvailableSearchModes,
} = window.BrowserListSelectors;

const { home, back, more, search, scroll } = window.BrowserListActions;

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
    };
};

export const BrowserList = (props) => {
    const [prevHistory, setPrevHistory] = useState(0);
    const scrollRef = useRef();
    const viewportRef = useRef();

    const {
        searching,
        currentSearchMode,
        currentState,
        history,
        serviceItems,
        searchModes,
    } = props;

    const _more = useCallback(() => {
        props.more(currentState);
    }, [props.more, currentState]);

    const _back = useCallback(() => {
        props.back();
    }, [props.back]);

    const _home = useCallback(() => {
        props.home();
    }, [props.home]);

    const moreThrottled = debounce(_more, 2000, {
        trailing: false,
        leading: true,
    });

    const _onScroll = useCallback(
        (e) => {
            const node = e.target;
            const height = node.scrollHeight - node.offsetHeight;

            // HACK: this happens when we press the back button for some reason
            if (height === -1 || node.scrollTop === 0) {
                return;
            }

            props.scroll(node.scrollTop);

            if (node.scrollTop + 50 > height) {
                moreThrottled();
            }
        },
        [props.scroll, currentState],
    );

    const _searchModeChange = useCallback(
        (e) => {
            const mode = e.target.getAttribute('data-mode');
            props.search(props.term, mode);
        },
        [props.term, props.search],
    );

    useEffect(() => {
        let timer;

        if (scrollRef.current) {
            const elem = scrollRef.current.rootNode;

            if (
                history.length === prevHistory.length - 1 &&
                currentState.scrollPosition
            ) {
                timer = window.setTimeout(() => {
                    elem.scrollTop = currentState.scrollPosition;
                }, 10);
            } else if (history.length !== prevHistory.length) {
                elem.scrollTop = 0;
            }
        }

        const updateTimer = window.setTimeout(
            () => setPrevHistory(history),
            10,
        );

        return () => {
            if (updateTimer) {
                window.clearTimeout(updateTimer);
            }

            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, [scrollRef.current, history, prevHistory, setPrevHistory]);

    const { items, title, source } = currentState || {};

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
                        onClick={_searchModeChange}
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
                <a onClick={_back} className="back-arrow" title="back">
                    <i className="material-icons">keyboard_arrow_left</i>
                </a>
                <a onClick={_home} className="home-button" title="home">
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
            <ul id="browser-container" ref={viewportRef}>
                <AutoSizer>
                    {({ height, width }) => (
                        <VirtualList
                            className="scrollcontainer"
                            height={height}
                            width={width}
                            itemSize={53}
                            itemCount={displayItems.length}
                            onScrollCapture={_onScroll}
                            ref={scrollRef}
                            renderItem={({ index, style }) => {
                                const position = index + 1;
                                const item = displayItems[index];
                                return (
                                    <BrowserListItem
                                        viewportRef={viewportRef}
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
};

export default connect(mapStateToProps, mapDispatchToProps)(BrowserList);
