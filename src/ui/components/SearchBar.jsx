import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import shallowCompare from 'shallow-compare';

import SearchBarSources from './SearchBarSources';

import { search, exitSearch } from '../reduxActions/BrowserListActions';

import {
    getCurrentState,
    getSearching,
    getSearchMode,
    getSearchSources
} from '../selectors/BrowserListSelectors';

function mapStateToProps(state) {
    return {
        term: state.browserList.searchTerm,
        currentState: getCurrentState(state),
        searching: getSearching(state),
        searchMode: getSearchMode(state),
        sources: getSearchSources(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        search: (term, mode) => dispatch(search(term, mode)),
        exitSearch: () => dispatch(exitSearch())
    };
}

export class SearchBar extends Component {
    constructor() {
        super();
        this.inputHandler = _.debounce(this._onChange.bind(this), 800, {
            trailing: true,
            leading: false
        });

        this.state = {
            term: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    UNSAFE_componentWillReceiveProps(props) {
        if (!props.term) {
            this.setState({
                term: null
            });
        }
    }

    render() {
        let cancelButton;

        if (this.props.searching) {
            cancelButton = (
                <i
                    className="material-icons"
                    onClick={this._onClick.bind(this)}
                >
                    cancel
                </i>
            );
        }

        return (
            <div id="search">
                <SearchBarSources {...this.props} />
                <input
                    type="text"
                    id="searchfield"
                    value={this.state.term}
                    onInput={this.inputHandler}
                />
                {cancelButton}
            </div>
        );
    }

    _onClick() {
        this.setState({
            term: null
        });
        this.props.exitSearch();
    }

    _onChange(e) {
        const term = e.target.value;

        this.setState({
            term
        });

        this.props.search(term, this.props.searchMode);

        e.preventDefault();
        e.stopPropagation();
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
