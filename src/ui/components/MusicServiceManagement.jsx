"use strict";

import _ from 'lodash';
import React from 'react/addons';

import MusicServiceManagementStore from '../stores/MusicServiceManagementStore';
import MusicServiceManagementActions from '../actions/MusicServiceManagementActions';

class MusicServiceManagement extends React.Component {

    constructor (props) {
		super(props);
        this.state = {};
    }

	componentDidMount() {
		MusicServiceManagementStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		this.setState({
            client: MusicServiceManagementStore.getClient(),
            link: MusicServiceManagementStore.getLink(),
        });
	}

	_cancel () {
		MusicServiceManagementActions.hideManagement();
	}

    _next () {
        if(!this.state.link) {
            MusicServiceManagementActions.getLink(this.state.client);
            return;
        }


	}

	render () {

        let link = <p>Click next to create a link to the Service</p>;

		if(!this.state.client) {
			return null;
		}

        if(this.state.link) {
            link = <a href={this.state.link.regUrl} target="_blank">{this.state.link.regUrl}</a>;
        }

		return (
			<div id="music-service-management">
				<div id="music-service-management-container">
					<p>
						{this.state.client.name}
					</p>

                    {{link}}

					<button onClick={this._cancel.bind(this)} className="cancel-button">Cancel</button>
                    <button onClick={this._next.bind(this)} className="next-button">Next</button>
				</div>
			</div>
		);
	}
}

export default MusicServiceManagement;
