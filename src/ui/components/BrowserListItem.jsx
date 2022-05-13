import get from 'lodash/get';
import debounce from 'lodash/debounce';

import React, { Fragment, Component, PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import shallowCompare from 'shallow-compare';

import { getClosest } from '../helpers/dom-utility';
import classnames from 'classnames';

import AlbumArt from './AlbumArt';

const {
    select,
    playNow,
    playNext,
    addQueue,
    replaceQueue,
    removeService,
    addService,
    addToPlaylist,
    editPlaylist,
    deletePlaylist,
    deleteFavourite,
} = window.BrowserListActions;

const mapDispatchToProps = {
    select,
    playNow,
    playNext,
    addQueue,
    replaceQueue,
    removeService,
    addService,
    addToPlaylist,
    editPlaylist,
    deletePlaylist,
    deleteFavourite,
};

class InlineMenu extends PureComponent {
    _playNow = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.playNow(item);
        this.props.toggle(e);
    };

    _playNext = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.playNext(item);
        this.props.toggle(e);
    };

    _addQueue = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.addQueue(item);
        this.props.toggle(e);
    };

    _replaceQueue = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.replaceQueue(item);
        this.props.toggle(e);
    };

    _removeService = (e) => {
        e.preventDefault();
        const item = this.props.model;
        this.props.removeService(item.service);
        this.props.toggle(e);
    };

    _addToPlaylist = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.addToPlaylist(item);
        this.props.toggle(e);
    };

    _editPlaylist = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.editPlaylist(item);
        this.props.toggle(e);
    };

    _deletePlaylist = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.deletePlaylist(item);
        this.props.toggle(e);
    };

    _deleteFavourite = (e) => {
        e.preventDefault();
        const item = get(this, 'props.model.parent') || this.props.model;
        this.props.deleteFavourite(item);
        this.props.toggle(e);
    };

    render() {
        const {
            model: item,
            isExpanded,
            onMouseOut,
            onMouseOver,
            containerRef,
        } = this.props;

        if (!isExpanded) {
            return null;
        }

        const isPlayNow =
            item.class === 'object.item.audioItem' ||
            item.itemType === 'program' ||
            (item.metadata &&
                item.class === 'object.item.audioItem.audioBroadcast');

        const isService = item.action === 'service';
        const isSonosPlaylist = item._raw && item._raw.parentID === 'SQ:';
        const isSonosFavourite = item._raw && item._raw.parentID === 'FV:2';

        const scrollContainerNode = getClosest(
            containerRef.current,
            '.scrollcontainer'
        );

        const inlineMenutOffset = isPlayNow || isService ? 37 : 37 * 5;

        const { top, height: listItemHeight } = getComputedStyle(
            containerRef.current
        );
        const { height: scrollContainerHeight } =
            getComputedStyle(scrollContainerNode);

        const openUpwards =
            parseInt(scrollContainerHeight) - parseInt(top) < inlineMenutOffset;

        const menuTop = openUpwards
            ? 10 - inlineMenutOffset
            : parseInt(listItemHeight) - 10;

        const menuClass = classnames({
            'inline-menu': true,
            upwards: openUpwards,
        });

        const styles = {
            top: `${menuTop}px`,
        };

        return (
            <ul
                style={styles}
                className={menuClass}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
            >
                {isPlayNow ? (
                    <li onClick={this._playNow}>Play Now</li>
                ) : isService ? (
                    <li onClick={this._removeService}>Remove</li>
                ) : (
                    <Fragment>
                        <li onClick={this._playNow}>Play Now</li>
                        <li onClick={this._playNext}>Play Next</li>
                        <li onClick={this._addQueue}>Add to Queue</li>
                        <li onClick={this._replaceQueue}>Replace Queue</li>
                        {!isSonosPlaylist && (
                            <li onClick={this._addToPlaylist}>
                                Add to playlist
                            </li>
                        )}
                        {isSonosPlaylist && (
                            <li onClick={this._editPlaylist}>Edit playlist</li>
                        )}
                        {isSonosPlaylist && (
                            <li onClick={this._deletePlaylist}>
                                Delete playlist
                            </li>
                        )}
                        {isSonosFavourite && (
                            <li onClick={this._deleteFavourite}>
                                Remove from Sonos Favourites
                            </li>
                        )}
                    </Fragment>
                )}
            </ul>
        );
    }
}

export class BrowserListItem extends Component {
    constructor() {
        super();
        this.liRef = createRef();
        this.state = {
            isExpanded: false,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidUpdate(prevProps) {
        if (this.props.model !== prevProps.model && this.clickedOnce) {
            this.clickedOnce = false;
            this._delayedClick = null;
        }
    }

    _onClick = () => {
        const item = this.props.model;

        if (
            isStreamUrl(item.uri) ||
            item.class === 'object.item.audioItem.musicTrack' ||
            item.class === 'object.item.audioItem' ||
            item.streamMetadata ||
            item.trackMetadata ||
            item.canEnumerate === 'false'
        ) {
            this.props.playNow(item);
        } else if (item.action === 'addService') {
            this.props.addService(item);
        } else {
            this.props.select(item);
        }

        return false;
    };

    handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!this._delayedClick) {
            this._delayedClick = debounce(this._onClick, 200, {
                leading: true,
                trailing: false,
            });
        }
        this._delayedClick(e);
    };

    _toggle = (e) => {
        this.setState({
            isExpanded: !this.state.isExpanded,
        });
        e.preventDefault();
        e.stopPropagation();
    };

    _hideMenu = () => {
        if (this.state.isExpanded) {
            this.setState({
                isExpanded: false,
            });
        }
    };

    _onMouseOut = (e) => {
        this._hideTimeout = window.setTimeout(this._hideMenu, 500);
        e.preventDefault();
        e.stopPropagation();
    };

    _onMouseOver = (e) => {
        if (this._hideTimeout) {
            window.clearTimeout(this._hideTimeout);
        }
        e.preventDefault();
        e.stopPropagation();
    };

    render() {
        let inlineMenuButton;
        const item = this.props.model;
        let className = 'trackinfo';

        let artistInfo;

        if (
            item.class ||
            item.action === 'service' ||
            item.trackMetadata ||
            JSON.parse(String(item.canPlay || 'false')) ||
            JSON.parse(String(get(item, 'parent.canPlay') || 'false'))
        ) {
            className = className + ' playable ';

            if (item.class) {
                className = className + /\.([-\w]+)$/gi.exec(item.class)[1];
            }

            if (item.itemType) {
                className = className + item.itemType;
            }

            inlineMenuButton = (
                <i
                    className="material-icons arrow"
                    onClick={this._toggle.bind(this)}
                >
                    arrow_drop_down_circle
                </i>
            );
        }

        const creator =
            item.creator || item.artist || get(item, 'trackMetadata.artist');

        const albumArtURI =
            item.albumArtURI ||
            get(item, 'trackMetadata.albumArtURI') ||
            get(item, 'streamMetadata.logo');

        const serviceId =
            get(this, 'props.model.service.service.Id') ||
            get(this, 'props.model.data.Id');

        if (creator) {
            className += ' with-creator';

            artistInfo = <p className="creator">{creator}</p>;
        }

        if (
            item.action === 'service' &&
            get(item, 'service.service.Name') === 'Local Music'
        ) {
            inlineMenuButton = null;
        }

        return (
            <li
                ref={this.liRef}
                onClick={this.handleClick}
                onMouseOut={this._onMouseOut}
                onMouseOver={this._onMouseOver}
                data-position={this.props.position}
                style={this.props.style}
            >
                <AlbumArt
                    src={albumArtURI}
                    serviceId={serviceId}
                    viewportRef={this.props.viewportRef}
                />

                <div className={className}>
                    <p className="title">{item.title}</p>
                    {artistInfo}
                </div>
                <InlineMenu
                    {...this.props}
                    containerRef={this.liRef}
                    isExpanded={this.state.isExpanded}
                    toggle={this._toggle}
                    onMouseOut={this._onMouseOut}
                    onMouseOver={this._onMouseOver}
                />
                {inlineMenuButton}
            </li>
        );
    }
}

export default connect(null, mapDispatchToProps)(BrowserListItem);
