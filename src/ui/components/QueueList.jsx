import _ from 'lodash';

import { h, Component } from 'preact';
import VirtualList from 'preact-virtual-list';

import QueueActions from '../actions/QueueActions';
import QueueStore from '../stores/QueueStore';

import QueueListItem from './QueueListItem';

import { getClosest } from '../helpers/dom-utility';

class QueueList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            tracks: QueueStore.getTracks(),
            position: QueueStore.getPosition(),
            expanded: QueueStore.getExpanded()
        };
    }

    componentDidMount() {
        QueueStore.addChangeListener(this._onChange.bind(this));

        this.setState({});
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.position && nextState.position !== this.state.position) {
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

    _onChange() {
        if (this.state.dragging) {
            return;
        }

        this.setState({
            tracks: QueueStore.getTracks(),
            position: QueueStore.getPosition(),
            expanded: QueueStore.getExpanded()
        });
    }

    _onClick() {
        QueueActions.flush();
    }

    _onDragStart(e) {
        this.setState({
            dragPosition: Number(e.target.getAttribute('data-position')),
            dragging: true
        });
    }

    _onDragEnd(e) {
        const newPos =
            this.state.dragOverMode === 'after'
                ? this.state.dragOverPosition + 1
                : this.state.dragOverPosition;

        QueueActions.changePosition(this.state.dragPosition, newPos);

        this.setState({
            dragPosition: false,
            dragging: false,
            dragOverPosition: null,
            dragOverMode: null
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
                dragOverMode: mode
            });
        } else if (this.state.dragOverMode || this.state.dragOverPosition) {
            this.setState({
                dragOverPosition: null,
                dragOverMode: null
            });
        }
    }

    _renderRow(row) {
        return row;
    }

    render() {
        const tracks = this.state.tracks;
        const selectionContext =
            _.filter(tracks, { selected: true }).length > 0;
        let queueItemNodes;
        let clearNode;

        if (tracks.length) {
            clearNode = (
                <a
                    id="queue-clear-button"
                    onClick={this._onClick.bind(this)}
                    title="Clear Queue"
                >
                    <i className="material-icons">clear_all</i>
                </a>
            );

            queueItemNodes = tracks.map((track, p) => {
                const position = p + 1;
                const isCurrent = position === this.state.position;
                const isDragging = position === this.state.dragPosition;
                const isDragOver = position === this.state.dragOverPosition;

                return (
                    <QueueListItem
                        key={position}
                        track={track}
                        position={position}
                        isCurrent={isCurrent}
                        isDragging={isDragging}
                        isDragOver={isDragOver}
                        dragOverMode={this.state.dragOverMode}
                        selectionContext={selectionContext}
                    />
                );
            });
        }

        const expandClass = this.state.expanded ? 'expanded' : 'collapsed';

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
                        <VirtualList
                            rowHeight={50}
                            sync={true}
                            class="scrollcontainer"
                            data={queueItemNodes || []}
                            renderRow={this._renderRow.bind(this)}
                        />
                    </ul>
                </div>
            </div>
        );
    }
}

export default QueueList;
