import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getClosest } from '../helpers/dom-utility';

import QueueListItem from './QueueListItem';

import {
    getExpanded,
    getTracks,
    getPositionInfo,
    getUpdateId,
} from '../selectors/QueueSelectors';

import { changePosition, flush } from '../reduxActions/QueueActions';

const mapStateToProps = (state) => {
    return {
        tracks: getTracks(state),
        position: getPositionInfo(state),
        expanded: getExpanded(state),
        updateId: getUpdateId(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        flush: () => dispatch(flush()),
        changePosition: (oldPos, newPos, updateId) =>
            dispatch(changePosition(oldPos, newPos, updateId)),
    };
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

    _onFlushClick() {
        this.props.flush();
    }

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
        const tracks = this.props.tracks || [];
        let queueItemNodes;
        let clearNode;

        if (tracks.length) {
            clearNode = (
                <a
                    id="queue-clear-button"
                    onClick={this._onFlushClick.bind(this)}
                    title="Clear Queue"
                >
                    <i className="material-icons">clear_all</i>
                </a>
            );

            queueItemNodes = tracks.map((track, p) => {
                const position = p + 1;
                const isCurrent = position === this.props.position;
                const isDragging = position === this.state.dragPosition;
                const isDragOver = position === this.state.dragOverPosition;

                return (
                    <QueueListItem
                        key={`${track.id || 'position'}-${position}`}
                        track={track}
                        position={position}
                        isCurrent={isCurrent}
                        isDragging={isDragging}
                        isDragOver={isDragOver}
                        dragOverMode={this.state.dragOverMode}
                    />
                );
            });
        }

        const expandClass = this.props.expanded ? 'expanded' : 'collapsed';

        return (
            <div className={expandClass} id="queue-list-container-wrapper">
                <h4 id="queue">QUEUE</h4>

                <div id="queue-list-container">
                    {clearNode}
                    <ul
                        id="queue-container"
                        onDragOver={this._onDragOver.bind(this)}
                        onDragStart={this._onDragStart.bind(this)}
                        onDragEnd={this._onDragEnd.bind(this)}
                    >
                        <div className="scrollcontainer">{queueItemNodes}</div>
                    </ul>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueList);
