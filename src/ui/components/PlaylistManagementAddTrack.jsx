import React, { Component, Fragment } from 'react';

export class PlaylistManagementAddTrack extends Component {
    _cancel = (e) => {
        e.preventDefault();
        this.props.hide();
    };

    _save = (e) => {
        e.preventDefault();
        const { selected, item, addItem } = this.props;

        const [id] = selected;
        addItem(id, item);
    };

    render() {
        const { playlists, selected, toggle } = this.props;

        const playlistNodes = playlists.map((list) => {
            const checkboxSymbol =
                selected.indexOf(list.id) > -1
                    ? 'check_box'
                    : 'check_box_outline_blank';

            const _toggleSelection = () => {
                toggle(list);
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

        return (
            <Fragment>
                <h3>Playlists</h3>

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

export default PlaylistManagementAddTrack;
