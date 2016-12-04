import _ from 'lodash';
import { h, Component } from 'preact'; //eslint-disable-line

import SearchBarActions from '../actions/SearchBarActions';

let term;

let func = _.debounce(() => {
	SearchBarActions.search(term);
}, 200);

class SearchBar extends Component {

	constructor() {
		super();
		this.state = {
			searching: false,
			term: '',
		};
	}

	render () {
		let cancelButton;

		if(this.state.searching) {
			cancelButton = (
				<i className="material-icons"
					onClick={this._onClick.bind(this)}>cancel</i>
			);
		}

		return (
			<div id="search">
				<input type="text" id="searchfield" value={this.state.term} oninput={this._onChange.bind(this)} />
				{cancelButton}
			</div>
		);
	}

	_onClick (e) {
		term = null;
		this.setState({
			searching: false,
			term: term || '',
		});
		func();
	}

	_onChange (e) {
		term = e.target.value;
		this.setState({
			searching: term.length > 0,
			term: term || '',
		});
		func();
		e.preventDefault();
		e.stopPropagation();
	}
}

export default SearchBar;
