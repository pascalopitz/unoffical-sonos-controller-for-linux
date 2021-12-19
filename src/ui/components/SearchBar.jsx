import _ from 'lodash';
import React, { useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import SearchBarSources from './SearchBarSources';

const { search, exitSearch } = window.BrowserListActions;

const { getCurrentState, getHasSearchTerm, getSearchMode, getSearchSources } =
    window.BrowserListSelectors;

function mapStateToProps(state) {
    return {
        term: state.browserList.searchTerm,
        currentState: getCurrentState(state),
        searching: getHasSearchTerm(state),
        searchMode: getSearchMode(state),
        sources: getSearchSources(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        search: (term, mode) => dispatch(search(term, mode)),
        exitSearch: () => dispatch(exitSearch()),
    };
}

export const SearchBar = (props) => {
    const ref = useRef();

    useEffect(() => {
        if (ref.current && (!props.term || props.term === '')) {
            ref.current.value = '';
        }
    }, [props.term, ref.current]);

    const _onClick = useCallback(() => {
        props.exitSearch();
        if (ref.current) {
            ref.current.value = '';
        }
    }, [props.exitSearch, ref.current]);

    const _onChange = useCallback(() => {
        if (ref.current) {
            const term = ref.current.value;
            props.search(term, props.searchMode);
        }
    }, [props.searchMode, ref.current]);

    const inputHandler = _.debounce(_onChange, 800, {
        trailing: true,
        leading: false,
    });

    const cancelButton = props.searching ? (
        <i className="material-icons" onClick={_onClick.bind(this)}>
            cancel
        </i>
    ) : null;

    return (
        <div id="search">
            <SearchBarSources {...props} />
            <input
                ref={ref}
                type="text"
                id="searchfield"
                onChange={inputHandler}
            />
            {cancelButton}
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
