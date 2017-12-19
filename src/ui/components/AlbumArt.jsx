import { h, Component } from 'preact';
import shallowCompare from 'shallow-compare';

import SonosService from '../services/SonosService';

import {
    getClosest,
    createIntersectionObserver,
    purgeIntersectionObserver
} from '../helpers/dom-utility';

import getServiceLogoUrl from '../helpers/getServiceLogoUrl';

const MIN_RATIO = 0.5;

export class AlbumArt extends Component {
    constructor() {
        super();
        this.state = {
            src: null,
            visible: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    _loadImage() {
        // here we make sure it's still visible, a URL and hasn't failed previously
        if (
            !this.state.visible ||
            (!this.props.src && !this.props.serviceId) ||
            this.state.failed
        ) {
            return;
        }

        const sonos = SonosService._currentDevice;
        const serviceId = this.props.serviceId;

        const url = this.props.serviceId
            ? getServiceLogoUrl(this.props.serviceId)
            : this.props.src;

        this.setState({
            loading: true
        });

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

        new Promise((resolve, reject) => {
            const img = new Image();
            img.src = srcUrl;
            img.onload = resolve;
            img.onerror = reject;
        })
            .then(() => {
                if (
                    this.props.src === url ||
                    this.props.serviceId === serviceId
                ) {
                    this.setState({
                        src: srcUrl,
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            })
            .catch(() => {
                if (
                    this.props.src === url ||
                    this.props.serviceId === serviceId
                ) {
                    this.setState({
                        failed: true,
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            });
    }

    componentDidMount() {
        const node = this.base;

        const options = {
            root: getClosest(node, this.props.parentType || 'ul'),
            rootMargin: '0px',
            threshold: MIN_RATIO
        };

        const callback = ([entry]) => {
            this.setState({
                visible: entry.intersectionRatio >= MIN_RATIO
            });
        };

        this.observer = createIntersectionObserver(node, options, callback);
    }

    componentDidUpdate() {
        if (this.state.visible && !this.state.src && !this.state.loading) {
            // wait some time, to prevent random scrolling fast through viewport
            // stuff to get loaded
            this.timeout = window.setTimeout(this._loadImage.bind(this), 500);
        }

        if (!this.state.visible && this.timeout) {
            window.clearTimeout(this.timeout);
        }
    }

    componentWillUnmount() {
        this.observer = purgeIntersectionObserver(this.observer);

        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
    }

    componentWillReceiveProps(props) {
        // HACK: prevent image ghosting when pressing back button
        if (
            props.src !== this.props.src ||
            props.serviceId !== this.props.serviceId
        ) {
            this.setState({
                src: null,
                failed: null
            });

            if (this.state.visible) {
                if (this.timeout) {
                    window.clearTimeout(this.timeout);
                }
                this.timeout = window.setTimeout(
                    this._loadImage.bind(this),
                    500
                );
            }
        }
    }

    render() {
        const src = this.state.src || 'images/browse_missing_album_art.png';

        const css = {
            backgroundImage: `url("${src}")`,
            backgroundSize: 'contain'
        };

        return (
            <div
                className="img"
                data-visible={this.state.visible}
                style={css}
            />
        );
    }
}

export default AlbumArt;
