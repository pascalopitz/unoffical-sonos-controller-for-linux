import React, { Component } from 'react';
import { connect } from 'react-redux';

import { hide, toggle, addItem } from '../reduxActions/PlaylistActions';

const mapStateToProps = (state) => {
    return {
        item: state.playlists.item,
        selected: state.playlists.selected,
        visible: state.playlists.visible,
        playlists: state.playlists.playlists,
    };
};

const mapDispatchToProps = {
    hide,
    toggle,
    addItem,
};

export class PlaylistManagement extends Component {
    _cancel = (e) => {
        e.preventDefault();
        this.props.hide();
    };

    _save = (e) => {
        e.preventDefault();
        const { selected, item, addItem} = this.props;

        const [id] = selected;
        this.props.addItem(id, item);
    };

    render() {
        const { visible, playlists, selected, toggle } = this.props;

        if (!visible) {
            return null;
        }

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
            <div id="playlist-management" className="modal">
                <div id="playlist-management-container" className="modal-inner">
                    <h3>Playlists</h3>

                    <ul>{playlistNodes}</ul>

                    <button onClick={this._cancel} className="cancel-button">
                        Cancel
                    </button>
                    <button onClick={this._save} className="save-button">
                        Save
                    </button>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistManagement);
