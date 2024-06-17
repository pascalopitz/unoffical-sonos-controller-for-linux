import React, {
    Fragment,
    useRef,
    useEffect,
    useCallback,
    useState,
} from 'react';
import { connect } from 'react-redux';

import { getClosest } from '../helpers/dom-utility';

import QueueListItem from './QueueListItem';

import {
    getExpanded,
    getTracks,
    getPositionInfo,
    getUpdateId,
} from '../../common/selectors/QueueSelectors';

const { changePosition, flush, saveQueue } = window.QueueActions;

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

export const QueueList = (props) => {
    const viewportRef = useRef();
    const [state, setState] = useState({
        dragging: false,
    });

    useEffect(() => {
        window.setTimeout(() => {
            const current = document.querySelector('*[data-is-current=true]');

            if (current) {
                current.scrollIntoViewIfNeeded();
            }
        }, 1000);
    }, [props.position]);

    const _onSaveClick = useCallback(() => {
        props.saveQueue();
    }, [props.saveQueue]);

    const _onFlushClick = useCallback(() => {
        props.flush();
    }, [props.flush]);

    const _onDragStart = useCallback(
        (e) => {
            setState({
                ...state,
                dragPosition: Number(e.target.getAttribute('data-position')),
                dragging: true,
            });
        },
        [setState],
    );

    const _onDragEnd = useCallback(() => {
        const newPos =
            state.dragOverMode === 'after'
                ? state.dragOverPosition + 1
                : state.dragOverPosition;

        props.changePosition(state.dragPosition, newPos, props.updateId);

        setState({
            ...state,
            dragPosition: false,
            dragging: false,
            dragOverPosition: null,
            dragOverMode: null,
        });
    }, [state, setState, props.changePosition, props.updateId]);

    const _onDragOver = useCallback(
        (e) => {
            const { dragOverMode, dragOverPosition } = state;

            const li = getClosest(e.target, 'li');

            if (li) {
                const rect = li.getBoundingClientRect();
                const midPoint = rect.top + rect.height / 2;

                const mode = e.clientY > midPoint ? 'after' : 'before';
                const position = Number(li.getAttribute('data-position'));

                if (mode === dragOverMode && position === dragOverPosition) {
                    return;
                }

                setState({
                    ...state,
                    dragOverPosition: position,
                    dragOverMode: mode,
                });
            } else if (dragOverMode || dragOverPosition) {
                setState({
                    ...state,
                    dragOverPosition: null,
                    dragOverMode: null,
                });
            }
        },
        [state, setState],
    );

    const { expanded, position, tracks = [] } = props;
    const { dragPosition, dragOverPosition } = state;

    const expandClass = expanded ? 'expanded' : 'collapsed';

    return (
        <div className={expandClass} id="queue-list-container-wrapper">
            <h4 id="queue">QUEUE</h4>

            <div id="queue-list-container">
                <ul
                    id="queue-container"
                    onDragOver={_onDragOver}
                    onDragStart={_onDragStart}
                    onDragEnd={_onDragEnd}
                    ref={viewportRef}
                >
                    <div className="scrollcontainer">
                        {tracks.map((track, p) => {
                            const trackPosition = p + 1;
                            const isCurrent = trackPosition === position;
                            const isDragging = trackPosition === dragPosition;
                            const isDragOver =
                                trackPosition === dragOverPosition;

                            return (
                                <QueueListItem
                                    key={`${
                                        track.id || 'position'
                                    }-${trackPosition}`}
                                    viewportRef={viewportRef}
                                    track={track}
                                    position={trackPosition}
                                    isCurrent={isCurrent}
                                    isDragging={isDragging}
                                    isDragOver={isDragOver}
                                    dragOverMode={state.dragOverMode}
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
                            onClick={_onSaveClick}
                            title="Save Queue as Playlist"
                        >
                            <i className="material-icons">save</i>
                        </a>
                        <a
                            id="queue-clear-button"
                            className="icon-button"
                            onClick={_onFlushClick}
                            title="Clear Queue"
                        >
                            <i className="material-icons">clear_all</i>
                        </a>
                    </Fragment>
                ) : null}
            </div>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(QueueList);
