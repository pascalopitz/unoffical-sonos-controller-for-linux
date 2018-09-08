import _ from 'lodash';
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import AlbumArt from './AlbumArt';

import {
    gotoPosition,
    removeTrack,
    removeSelectedTracks,
    select,
    deselect
} from '../reduxActions/QueueActions';

const mapStateToProps = state => {
    return {
        selected: state.queue.selected
    };
};

const mapDispatchToProps = dispatch => {
    return {
        select: pos => dispatch(select(pos)),
        deselect: pos => dispatch(deselect(pos)),
        gotoPosition: pos => dispatch(gotoPosition(pos)),
        removeTrack: pos => dispatch(removeTrack(pos)),
        removeSelectedTracks: () => dispatch(removeSelectedTracks())
    };
};

export class QueueListItem extends Component {
    constructor() {
        super();
        this.state = {
            isExpanded: false
        };
    }

    _isSelected() {
        return _.includes(this.props.selected, this.props.track.id);
    }

    _isInSelectionContext() {
        return this.props.selected.length > 0;
    }

    _hideMenu() {
        if (this.state.isExpanded) {
            this.setState({
                isExpanded: false
            });
        }
    }

    _toggle(e) {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
        e.preventDefault();
        e.stopPropagation();
    }

    _onMouseOut(e) {
        this._hideTimeout = window.setTimeout(this._hideMenu.bind(this), 500);
        e.preventDefault();
        e.stopPropagation();
    }

    _onMouseOver(e) {
        if (this._hideTimeout) {
            window.clearTimeout(this._hideTimeout);
        }
        e.preventDefault();
        e.stopPropagation();
    }

    _onClick(e) {
        this.props.gotoPosition(this.props.position);
        e.preventDefault();
        e.stopPropagation();
    }

    _playNow(e) {
        this.props.gotoPosition(this.props.position);
        this._toggle(e);
    }

    _removeTrack(e) {
        this.props.removeTrack(this.props.position);
        this._toggle(e);
    }

    _removeSelected(e) {
        this.props.removeSelectedTracks();
        this._toggle(e);
    }

    _toggleSelection(e) {
        const isSelected = this._isSelected();

        if (!isSelected) {
            this.props.select(this.props.position);
        } else {
            this.props.deselect(this.props.position);
        }

        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        let inlineMenu;
        let dragOver = false;

        const track = this.props.track;

        const selectionContext = this._isInSelectionContext();
        const isSelected = this._isSelected();

        const checkboxSymbol = isSelected
            ? 'check_box'
            : 'check_box_outline_blank';

        const inlineMenuButton = (
            <i
                className="material-icons arrow"
                onClick={this._toggle.bind(this)}
                title="Open menu"
            >
                arrow_drop_down_circle
            </i>
        );

        const selectionToggle = (
            <i
                className="material-icons checkbox"
                onClick={this._toggleSelection.bind(this)}
                title="Check this track"
            >
                {checkboxSymbol}
            </i>
        );

        if (this.state.isExpanded) {
            if (selectionContext) {
                inlineMenu = (
                    <ul
                        className="inline-menu"
                        onMouseOut={this._onMouseOut.bind(this)}
                        onMouseOver={this._onMouseOver.bind(this)}
                    >
                        <li onClick={this._playNow.bind(this)}>Play Track</li>
                        <li onClick={this._removeSelected.bind(this)}>
                            Remove Selected Track(s)
                        </li>
                    </ul>
                );
            } else {
                inlineMenu = (
                    <ul
                        className="inline-menu"
                        onMouseOut={this._onMouseOut.bind(this)}
                        onMouseOver={this._onMouseOver.bind(this)}
                    >
                        <li onClick={this._playNow.bind(this)}>Play Track</li>
                        <li onClick={this._removeTrack.bind(this)}>
                            Remove Track
                        </li>
                    </ul>
                );
            }
        }

        if (this.props.isDragOver) {
            dragOver = this.props.dragOverMode;
        }

        const htmlTitle = 'Play "' + track.creator + ' - ' + track.title + '"';

        return (
            <li
                onClick={this._onClick.bind(this)}
                onMouseOut={this._onMouseOut.bind(this)}
                onMouseOver={this._onMouseOver.bind(this)}
                data-position={this.props.position}
                data-dragging={this.props.isDragging}
                data-dragover={dragOver}
                data-is-selected={isSelected}
                data-is-current={this.props.isCurrent}
                draggable="true"
                title={htmlTitle}
            >
                <AlbumArt src={track.albumArtURI} />
                <div className="trackinfo">
                    <p className="title">{track.title}</p>
                    <p className="artist">{track.creator}</p>
                </div>
                {selectionToggle}
                {inlineMenu}
                {inlineMenuButton}
            </li>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(QueueListItem);
