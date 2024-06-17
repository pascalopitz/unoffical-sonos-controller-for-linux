import React, { Component, Fragment } from 'react';

import { getClosest } from '../helpers/dom-utility';

import AlbumArt from './AlbumArt';

const initialState = { tracks: [], loaded: false };

export class PlaylistManagementEdit extends Component {
    state = initialState;

    static getDerivedStateFromProps(nextProps, state) {
        if (state.loaded || !nextProps.items || !nextProps.items.length) {
            return null;
        }

        return {
            tracks: [...nextProps.items],
            loaded: true,
        };
    }

    _cancel = (e) => {
        e.preventDefault();
        this.setState(initialState);
        this.props.hide();
    };

    _removeTrack = (track) => {
        const { item, updateID, deleteItem } = this.props;
        const { tracks } = this.state;

        const position = tracks.indexOf(track) + 1;

        deleteItem(item._raw.id, updateID, position);

        const newTracks = tracks.filter((t) => t.id !== track.id);

        this.setState({
            tracks: newTracks,
        });
    };

    _onDragStart(e) {
        this.setState({
            dragPosition: Number(e.target.getAttribute('data-position')),
            dragging: true,
        });
    }

    _onDragEnd() {
        const { item, updateID, moveItem } = this.props;
        const { tracks, dragOverMode, dragOverPosition, dragPosition } =
            this.state;

        const newPos =
            dragOverMode === 'after' ? dragOverPosition + 1 : dragOverPosition;

        const trackToMove = tracks.find(
            (track, idx) => idx + 1 === dragPosition,
        );

        const insertAfter = newPos > dragPosition;
        const isertIdx = insertAfter ? newPos - 2 : newPos - 1;

        const newTracks = [...tracks];
        newTracks.splice(dragPosition - 1, 1);
        newTracks.splice(isertIdx, 0, trackToMove);

        moveItem(item._raw.id, updateID, dragPosition, newPos);

        this.setState({
            tracks: newTracks,
            dragPosition: false,
            dragging: false,
            dragOverPosition: null,
            dragOverMode: null,
        });
    }

    _onDragOver(e) {
        const li = getClosest(e.target, 'li');

        if (li) {
            const rect = li.getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;

            const mode = e.clientY > midPoint ? 'after' : 'before';
            const position = Number(li.getAttribute('data-position'));

            if (
                mode === this.state.dragOverMode &&
                position === this.state.dragOverPosition
            ) {
                return;
            }

            this.setState({
                dragOverPosition: position,
                dragOverMode: mode,
            });
        } else if (this.state.dragOverMode || this.state.dragOverPosition) {
            this.setState({
                dragOverPosition: null,
                dragOverMode: null,
            });
        }
    }

    render() {
        const { item } = this.props;
        const { tracks, dragOverPosition, dragPosition, dragOverMode } =
            this.state;

        const playlistNodes = tracks.map((track, p) => {
            const position = p + 1;
            const isDragging = position === dragPosition;
            const dragOver =
                position === dragOverPosition ? dragOverMode : null;

            return (
                <li
                    key={`${track.id || 'position'}-${position}`}
                    draggable="true"
                    data-position={position}
                    data-dragging={isDragging}
                    data-dragover={dragOver}
                >
                    <AlbumArt src={track.albumArtURI} />
                    <div className="trackinfo">
                        <p className="title">{track.title}</p>
                        <p className="artist">{track.artist}</p>
                    </div>

                    <i
                        className="material-icons checkbox"
                        onClick={() => this._removeTrack(track)}
                    >
                        cancel
                    </i>
                </li>
            );
        });

        return (
            <Fragment>
                <h3>Edit Playlist {item.title}</h3>

                <ul
                    className="playlist-tracks"
                    onDragOver={this._onDragOver.bind(this)}
                    onDragStart={this._onDragStart.bind(this)}
                    onDragEnd={this._onDragEnd.bind(this)}
                >
                    {playlistNodes}
                </ul>

                <button onClick={this._cancel} className="save-button">
                    Done
                </button>
            </Fragment>
        );
    }
}

export default PlaylistManagementEdit;
