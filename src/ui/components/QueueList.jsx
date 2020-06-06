import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { getClosest } from '../helpers/dom-utility';

import QueueListItem from './QueueListItem';

import {
    getExpanded,
    getTracks,
    getPositionInfo,
    getUpdateId,
} from '../selectors/QueueSelectors';

import { changePosition, flush, saveQueue } from '../reduxActions/QueueActions';

const mapStateToProps = (state) => {
    return {
        tracks: getTracks(state),
        position: getPositionInfo(state),
        expanded: getExpanded(state),
        updateId: getUpdateId(state),
    };
};

const mapDispatchToProps = {
    flush,
    saveQueue,
    changePosition,
};

export class QueueList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
        };
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (nextState.position && nextState.position !== this.props.position) {
            // HACK, can this be done cleanly?
            window.setTimeout(() => {
                const current = document.querySelector(
                    '*[data-is-current=true]'
                );

                if (current) {
                    current.scrollIntoViewIfNeeded();
                }
            }, 1000);
        }
    }

    _onSaveClick = () => {
        this.props.saveQueue();
    };

    _onFlushClick = () => {
        this.props.flush();
    };

    _onDragStart(e) {
        this.setState({
            dragPosition: Number(e.target.getAttribute('data-position')),
            dragging: true,
        });
    }

    _onDragEnd() {
        const newPos =
            this.state.dragOverMode === 'after'
                ? this.state.dragOverPosition + 1
                : this.state.dragOverPosition;

        this.props.changePosition(
            this.state.dragPosition,
            newPos,
            this.props.updateId
        );

        this.setState({
            dragPosition: false,
            dragging: false,
            dragOverPosition: null,
            dragOverMode: null,
        });
    }

    _onDragOver(e) {
        const { dragOverMode, dragOverPosition } = this.state;

        const li = getClosest(e.target, 'li');

        if (li) {
            const rect = li.getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;

            const mode = e.clientY > midPoint ? 'after' : 'before';
            const position = Number(li.getAttribute('data-position'));

            if (mode === dragOverMode && position === dragOverPosition) {
                return;
            }

            this.setState({
                dragOverPosition: position,
                dragOverMode: mode,
            });
        } else if (dragOverMode || dragOverPosition) {
            this.setState({
                dragOverPosition: null,
                dragOverMode: null,
            });
        }
    }

    render() {
        const { expanded, position, tracks = [] } = this.props;
        const { dragPosition, dragOverPosition } = this.state;

        const expandClass = expanded ? 'expanded' : 'collapsed';

        return (
            <div className={expandClass} id="queue-list-container-wrapper">
                <h4 id="queue">QUEUE</h4>

                <div id="queue-list-container">
                    <ul
                        id="queue-container"
                        onDragOver={this._onDragOver.bind(this)}
                        onDragStart={this._onDragStart.bind(this)}
                        onDragEnd={this._onDragEnd.bind(this)}
                    >
                        <div className="scrollcontainer">
                            {tracks.map((track, p) => {
                                const trackPosition = p + 1;
                                const isCurrent = trackPosition === position;
                                const isDragging =
                                    trackPosition === dragPosition;
                                const isDragOver =
                                    trackPosition === dragOverPosition;

                                return (
                                    <QueueListItem
                                        key={`${
                                            track.id || 'position'
                                        }-${trackPosition}`}
                                        track={track}
                                        position={trackPosition}
                                        isCurrent={isCurrent}
                                        isDragging={isDragging}
                                        isDragOver={isDragOver}
                                        dragOverMode={this.state.dragOverMode}
                                    />
                                );
                            })}
                        </div>
                    </ul>
                    {tracks.length ? (
                        <Fragment>
                            <a
                                id="queue-save-button"
                                className="icon-button"
                                onClick={this._onSaveClick.bind(this)}
                                title="Save Queue as Playlist"
                            >
                                <i className="material-icons">save</i>
                            </a>
                            <a
                                id="queue-clear-button"
                                className="icon-button"
                                onClick={this._onFlushClick.bind(this)}
                                title="Clear Queue"
                            >
                                <i className="material-icons">clear_all</i>
                            </a>
                        </Fragment>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueList);
