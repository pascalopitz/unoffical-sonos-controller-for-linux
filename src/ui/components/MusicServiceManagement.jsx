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
        this.state = {};
		MusicServiceManagementActions.hideManagement();
	}

    _next () {
        if(!this.state.link && this.state.client.auth === 'UserId') {
            console.log(this.state);
            return;
        }

        if(!this.state.link && this.state.client.auth === 'Anonymous') {
            MusicServiceManagementActions.addAnonymousService(this.state.client);
        }

        if(!this.state.link && this.state.client.auth === 'DeviceLink') {
            MusicServiceManagementActions.getLink(this.state.client);
            return;
        }
	}

    _changeUserName (e) {
        this.setState({
            username: e.target.value
        });
    }

    _changePassword (e) {
        this.setState({
            password: e.target.value
        });
    }

	render () {

        let link;

		if(!this.state.client) {
			return null;
		}

        if(this.state.client.auth === 'Anonymous') {
            link = <p>Click next to add Service</p>;
        }

        if(this.state.client.auth === 'UserId') {
            link = (<form>
                <div>
                    <label>Username</label>
                    <input type="text" onChange={this._changeUserName.bind(this)} />
                </div>

                <div>
                    <label>Password</label>
                    <input type="password" onChange={this._changePassword.bind(this)} />
                </div>
            </form>);
        }

        if(this.state.client.auth === 'DeviceLink' && !this.state.link) {
            link = <p>Click next to create a link to the Service</p>;
        }

        if(this.state.client.auth === 'DeviceLink' && this.state.link) {
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
