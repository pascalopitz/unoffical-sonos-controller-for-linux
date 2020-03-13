import { shell } from 'electron';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    hideManagement,
    getSession,
    getLink,
    addAnonymousService
} from '../reduxActions/MusicServicesActions';

const mapStateToProps = state => {
    return {
        client: state.musicServices.current,
        link: state.musicServices.link,
        visible: state.musicServices.visible
    };
};

const mapDispatchToProps = dispatch => {
    return {
        hideManagement: () => dispatch(hideManagement()),
        getSession: (service, username, client) =>
            dispatch(getSession(service, username, client)),
        getLink: service => dispatch(getLink(service)),
        addAnonymousService: service => dispatch(addAnonymousService(service))
    };
};

export class MusicServiceManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    _openLink() {
        shell.openExternal(this.props.link.regUrl);
    }

    _cancel() {
        this.setState(null);
        this.props.hideManagement();
    }

    _next() {
        const {
            link,
            client,
            addAnonymousService,
            getLink,
            getSession
        } = this.props;
        const { auth } = client;

        if (!link && auth === 'UserId') {
            return getSession(client, this.state.username, this.state.password);
        }

        if (!link && auth === 'Anonymous') {
            return addAnonymousService(client);
        }

        if (!link && (auth === 'DeviceLink' || auth === 'AppLink')) {
            return getLink(client);
        }
    }

    _changeUserName(e) {
        this.setState({
            username: e.target.value
        });
    }

    _changePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    render() {
        const { link, client, visible } = this.props;

        if (!visible || !client) {
            return null;
        }

        let linkNode;
        let nextButton = (
            <button onClick={this._next.bind(this)} className="next-button">
                Next
            </button>
        );

        if (client.auth === 'Anonymous') {
            linkNode = <p>Click next to add the Service at your own risk.</p>;
        }

        if (client.auth === 'UserId') {
            linkNode = (
                <form>
                    <p>Click next to add the Service at your own risk.</p>
                    <div>
                        <label>Username</label>
                        <input
                            type="text"
                            onChange={this._changeUserName.bind(this)}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            onChange={this._changePassword.bind(this)}
                        />
                    </div>
                </form>
            );
        }

        if (
            (client.auth === 'DeviceLink' || client.auth === 'AppLink') &&
            !link
        ) {
            linkNode = <p>Click next to add the Service at your own risk.</p>;
        }

        if (
            (client.auth === 'DeviceLink' || client.auth === 'AppLink') &&
            link
        ) {
            nextButton = null;

            const code =
                link.showLinkCode !== 'true' ? null : (
                    <p>
                        Your device link code: <strong>{link.linkCode}</strong>
                    </p>
                );

            linkNode = (
                <div>
                    <p>
                        Click the link below to authorize this app to use the
                        Service.
                    </p>
                    <a
                        onClick={this._openLink.bind(this)}
                        target="_blank"
                        style={{ cursor: 'pointer' }}
                    >
                        {link.regUrl}
                    </a>
                    {code}
                </div>
            );
        }

        return (
            <div id="music-service-management">
                <div id="music-service-management-container">
                    <h3>{client.name}</h3>

                    <div>
                        <p>
                            This feature is super experimental and untested
                            mostly. It might not work at all or lead to
                            unexpected behaviour.
                        </p>
                        <p>
                            Unlike the offical Sonos apps, this will require you
                            to authenticate against the music service again, as
                            auth tokens cannot be retrieved from the sonos
                            players.
                        </p>
                    </div>

                    {linkNode}

                    <button
                        onClick={this._cancel.bind(this)}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                    {nextButton}
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MusicServiceManagement);
