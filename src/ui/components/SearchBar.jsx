import _ from 'lodash';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import SearchBarSources from './SearchBarSources';

import { search, exitSearch } from '../reduxActions/BrowserListActions';

import {
    getCurrentState,
    getSearching,
    getSearchMode,
    getSearchSources,
    getSearchModes
} from '../selectors/BrowserListSelectors';

function mapStateToProps(state) {
    return {
        term: state.browserList.searchTerm,
        currentState: getCurrentState(state),
        searching: getSearching(state),
        searchMode: getSearchMode(state),
        sources: getSearchSources(state),
        modes: getSearchModes(state)
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
                    value={this.props.term}
                    onInput={this.inputHandler}
                />
                {cancelButton}
            </div>
        );
    }

    _onClick() {
        this.props.exitSearch();
    }

    _onChange(e) {
        const term = e.target.value;
        this.props.search(term, this.props.searchMode);
        e.preventDefault();
        e.stopPropagation();
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
