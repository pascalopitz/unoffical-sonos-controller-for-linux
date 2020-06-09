import _ from 'lodash';

import React, { Component } from 'react';
import shallowCompare from 'shallow-compare';

import SonosService from '../services/SonosService';
import { getByServiceId } from '../services/MusicServiceClient';

import {
    getClosest,
    createIntersectionObserver,
    purgeIntersectionObserver,
} from '../helpers/dom-utility';

import getServiceLogoUrl from '../helpers/getServiceLogoUrl';
import makeCancelable from '../helpers/makeCancelable';

const MIN_RATIO = 0.5;

export class AlbumArt extends Component {
    state = {
        src: null,
        visible: false,
        loading: false,
        loaded: false,
    };

    constructor() {
        super();
        this.ref = React.createRef();
    }

    async _loadImage() {
        const { visible, failed, src, propsSrc } = this.state;
        // here we make sure it's still visible, a URL and hasn't failed previously
        if (!visible || failed) {
            return;
        }

        if (this.loadPromise) {
            this.loadPromise.cancel();
        }

        this.loadPromise = this.makeLoadPromise(src);
        this.loadPromise.promise
            .then(() => {
                this.setState({
                    failed: false,
                    loading: false,
                    loaded: true,
                });
            })
            .catch(async (err) => {
                if (err && err.isCancelled) {
                    return;
                }

                if (!this.ref.current || !this.state.visible) {
                    return;
                }

                try {
                    const urlToParse = propsSrc.match(/^\//)
                        ? `http://localhost${propsSrc}`
                        : propsSrc;

                    const parsed = new URL(
                        new URL(urlToParse).searchParams.get('u')
                    );

                    const sid = parsed.searchParams.get('sid');

                    if (!sid) {
                        return;
                    }

                    const client = getByServiceId(sid);

                    if (!client) {
                        return null;
                    }

                    const response = await client.getExtendedMetadata(
                        decodeURIComponent(parsed.pathname).replace('.mp3', '')
                    );

                    const newSrc = _.get(
                        response,
                        'mediaMetadata.trackMetadata.albumArtURI'
                    );

                    if (newSrc && propsSrc === this.state.propsSrc) {
                        this.setState(
                            {
                                src: newSrc,
                                loading: false,
                            },
                            () => {
                                this._loadImage();
                            }
                        );

                        return;
                    }
                } catch (e) {
                    // noop
                }

                this.setState({
                    failed: true,
                    loading: false,
                    loaded: false,
                });
            });
    }

    makeLoadPromise = () => {
        return makeCancelable(
            new Promise((resolve, reject) => {
                const img = new Image();
                img.src = this.state.src;
                img.onload = resolve;
                img.onerror = reject;
            })
        );
    };

    componentDidMount() {
        const node = this.ref.current;

        const options = {
            root: getClosest(node, this.props.parentType || 'ul'),
            rootMargin: '0px',
            threshold: MIN_RATIO,
        };

        const callback = ([entry]) => {
            this.setState({
                visible: entry.intersectionRatio >= MIN_RATIO,
            });
        };

        this.observer = createIntersectionObserver(node, options, callback);
    }

    componentWillUnmount() {
        this.observer = purgeIntersectionObserver(this.observer);

        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }

        if (this.loadPromise) {
            this.loadPromise.cancel();
        }

        this.setState({
            src: null,
            loaded: false,
            loading: false,
            visible: false,
        });
    }

    static getDerivedStateFromProps(nextProps, ownState) {
        const { visible, loading, propsSrc, propsServiceId } = ownState;
        const { serviceId, src } = nextProps;

        if (
            !visible ||
            (propsSrc && src === propsSrc) ||
            (propsServiceId && serviceId === propsServiceId)
        ) {
            return null;
        }

        const needsRecompute =
            src ||
            serviceId ||
            (propsSrc && !src) ||
            (!serviceId && propsServiceId);

        if (visible && needsRecompute) {
            const sonos = SonosService._currentDevice;

            const url =
                src && typeof src === 'object' && src._
                    ? src._
                    : serviceId
                    ? getServiceLogoUrl(serviceId)
                    : src;

            if (url && typeof url === 'string') {
                const srcUrl =
                    url.indexOf('https://') === 0 ||
                    url.indexOf('http://') === 0 ||
                    url.match(/^\.\/(svg|images)/)
                        ? url
                        : 'http://' +
                          sonos.host +
                          ':' +
                          sonos.port +
                          decodeURIComponent(url);

                return {
                    failed: false,
                    loaded: false,
                    loading: true,
                    src: srcUrl,
                    propsSrc: src,
                    propsServiceId: serviceId,
                };
            } else {
                return {
                    failed: false,
                    loaded: true,
                    loading: false,
                    src: null,
                    propsSrc: src,
                    propsServiceId: serviceId,
                };
            }
        }

        if (!visible && loading) {
            return {
                failed: false,
                loaded: false,
                loading: false,
                src: null,
            };
        }

        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.loading && !prevState.loading) {
            this._loadImage();
        }
    }

    render() {
        const { visible, loaded, loading, src } = this.state;

        const srcUrl =
            src && loaded && !loading
                ? src
                : 'images/browse_missing_album_art.png';

        const css = {
            backgroundImage: `url("${srcUrl}")`,
            backgroundSize: 'contain',
        };

        return (
            <div
                ref={this.ref}
                className="img"
                data-visible={visible}
                style={css}
                data-src-computed={src}
                data-src-prop={this.props.src}
            />
        );
    }
}

export default AlbumArt;
