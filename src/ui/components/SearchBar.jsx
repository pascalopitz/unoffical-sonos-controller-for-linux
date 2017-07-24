import _ from 'lodash';
import { h, Component } from 'preact'; //eslint-disable-line

import SearchBarActions from '../actions/SearchBarActions';

class SearchBar extends Component {
    constructor() {
        super();
        this.state = {
            searching: false,
            term: ''
        };
    }

    render() {
        let cancelButton;

        if (this.state.searching) {
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
                <input
                    type="text"
                    id="searchfield"
                    value={this.state.term}
                    onInput={_.debounce(this._onChange.bind(this), 200)}
                />
                {cancelButton}
            </div>
        );
    }

    _onClick() {
        this.setState({
            searching: false,
            term: ''
        });
        SearchBarActions.search(null);
    }

    _onChange(e) {
        const term = e.target.value;
        this.setState({
            searching: term.length > 0,
            term: term || ''
        });
        SearchBarActions.search(term);
        e.preventDefault();
        e.stopPropagation();
    }
}

export default SearchBar;
