import { h, Component } from 'preact'; //eslint-disable-line
import AlbumArt from './AlbumArt';

import QueueActions from '../actions/QueueActions';

class QueueListItem extends Component {
    constructor() {
        super();
        this.state = {
            isExpanded: false
        };
    }

    _isSelected() {
        return this.props.track.selected;
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
        QueueActions.gotoPosition(this.props.position);
        e.preventDefault();
        e.stopPropagation();
    }

    _playNow(e) {
        QueueActions.gotoPosition(this.props.position);
        this._toggle(e);
    }

    _removeTrack(e) {
        QueueActions.removeTrack(this.props.position);
        this._toggle(e);
    }

    _removeSelected(e) {
        QueueActions.removeSelected();
        this._toggle(e);
    }

    _toggleSelection(e) {
        const isSelected = this._isSelected();

        if (!isSelected) {
            QueueActions.select(this.props.position);
        } else {
            QueueActions.deselect(this.props.position);
        }

        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        let inlineMenu;
        let dragOver = false;

        const track = this.props.track;

        const selectionContext = this.props.selectionContext;
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
                    <p className="title">
                        {track.title}
                    </p>
                    <p className="artist">
                        {track.creator}
                    </p>
                </div>
                {selectionToggle}
                {inlineMenu}
                {inlineMenuButton}
            </li>
        );
    }
}

export default QueueListItem;
