import _ from 'lodash';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import { search } from '../reduxActions/BrowserListActions';

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
        search: term => dispatch(search(term))
    };
}

export class SearchBar extends Component {
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
                <select></select>
                <input
                    type="text"
                    id="searchfield"
                    value={this.props.term}
                    onInput={_.debounce(this._onChange.bind(this), 200)}
                />
                {cancelButton}
            </div>
        );
    }

    _onClick() {
        this.props.search(null);
    }

    _onChange(e) {
        const term = e.target.value;
        this.props.search(term);
        e.preventDefault();
        e.stopPropagation();
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
