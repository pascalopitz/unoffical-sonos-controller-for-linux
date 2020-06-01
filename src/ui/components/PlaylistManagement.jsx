import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    hide,
    toggle,
    addItem,
    moveItem,
    deleteItem,
} from '../reduxActions/PlaylistActions';

import classnames from 'classnames';

import PlaylistManagementAddTrack from './PlaylistManagementAddTrack';
import PlaylistManagementEdit from './PlaylistManagementEdit';

const mapStateToProps = (state) => {
    return {
        ...state.playlists,
    };
};

const mapDispatchToProps = {
    hide,
    toggle,
    addItem,
    moveItem,
    deleteItem,
};

export class PlaylistManagementControl extends Component {
    render() {
        const { visible, mode } = this.props;

        if (!visible) {
            return null;
        }

        return (
            <div
                id="playlist-management"
                className={classnames({
                    modal: true,
                    [mode]: true,
                })}
            >
                <div id="playlist-management-container" className="modal-inner">
                    {mode === 'add' && (
                        <PlaylistManagementAddTrack {...this.props} />
                    )}
                    {mode === 'edit' && (
                        <PlaylistManagementEdit {...this.props} />
                    )}
                </div>
            </div>
        );
    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlaylistManagementControl);
