import React, { Component, Fragment } from 'react';

export class PlaylistManagementSave extends Component {
    state = {
        name: '',
    };

    _cancel = (e) => {
        e.preventDefault();
        this.props.hide();
    };

    _save = (e) => {
        e.preventDefault();
        const { selected, playlists, saveQueue } = this.props;
        const { name } = this.state;

        let params;

        if (selected.length > 0) {
            const match = playlists.find((l) => l.id === selected[0]);

            params = {
                Title: match.title,
                ObjectID: match._raw.id,
            };
        } else {
            params = {
                Title: name,
            };
        }

        saveQueue(params);
    };

    _toggle = (list) => {
        this.props.toggle(list);
    };

    _onInputChange = (e) => {
        e.preventDefault();
        this.setState({
            name: e.target.value,
        });
    };

    render() {
        const { playlists, selected } = this.props;
        const { name } = this.state;

        const playlistNodes = playlists.map((list) => {
            const checkboxSymbol =
                selected.indexOf(list.id) > -1
                    ? 'check_box'
                    : 'check_box_outline_blank';

            const _toggleSelection = () => {
                this._toggle(list);
            };

            return (
                <li key={list.id}>
                    <span>{list.title}</span>
                    <i
                        className="material-icons checkbox"
                        onClick={_toggleSelection}
                    >
                        {checkboxSymbol}
                    </i>
                </li>
            );
        });

        const replaceList = selected.length > 0;
        const renderName = replaceList ? '' : name;

        return (
            <Fragment>
                <h3>Save as new playlist</h3>

                <input
                    type="text"
                    disabled={replaceList}
                    value={renderName}
                    onChange={this._onInputChange}
                />

                <h3>Or replace a playlist</h3>

                <ul>{playlistNodes}</ul>

                <button onClick={this._cancel} className="cancel-button">
                    Cancel
                </button>
                <button onClick={this._save} className="save-button">
                    Save
                </button>
            </Fragment>
        );
    }
}

export default PlaylistManagementSave;
