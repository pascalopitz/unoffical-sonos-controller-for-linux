"use strict";

import _ from 'lodash';
import React from 'react';

import SearchBarActions from '../actions/SearchBarActions';

let term;

let func = _.debounce(() => {
	SearchBarActions.search(term);
}, 100);

class SearchBar extends React.Component {

	constructor() {
		super();
		this.state = {
			searching: false,
			term: null,
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
				<input type="text" id="searchfield" value={this.state.term} onChange={this._onChange.bind(this)} />
				{cancelButton}
			</div>
		);
	}

	_onClick (e) {
		term = null;
		this.setState({
			searching: false,
			term: term,
		});
		func();
	}

	_onChange (e) {
		term = e.target.value;
		this.setState({
			searching: term.length > 0,
			term: term,
		});
		func();
		e.preventDefault();
		e.stopPropagation();
	}
}

export default SearchBar;
