import _ from 'lodash';
import xml2json from 'jquery-xml2json';

import { h, Component } from 'preact'; //eslint-disable-line

import SonosService from '../services/SonosService';
import resourceLoader from '../helpers/resourceLoader';

import { getClosest } from '../helpers/dom-utility';

const SERVICE_LOGOS_URI =
    'http://update-services.sonos.com/services/mslogo.xml';

const MIN_RATIO = 0.5;

let ServiceImageMap;

fetch(SERVICE_LOGOS_URI).then(res => res.text()).then(res => {
    const xml = xml2json(res);
    ServiceImageMap = xml.images;
});

function getServiceLogoUrl(id) {
    if (!id) {
        return;
    }

    const encodedId = String(7 + Number(id) * 256);
    const match = _.find(
        ServiceImageMap['acr-hdpi'].service,
        i => _.get(i, '$.id') === encodedId
    );

    return _.get(match, 'image._');
}

class AlbumArt extends Component {
    constructor() {
        super();
        this.state = {
            src: null,
            visible: false
        };
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
            url.indexOf('https://') === 0 || url.indexOf('http://') === 0
                ? url
                : 'http://' +
                  sonos.host +
                  ':' +
                  sonos.port +
                  decodeURIComponent(url);

        this.srcUrl = srcUrl;
        this.promise = resourceLoader
            .add(srcUrl)
            .then(data => {
                if (
                    this.props.src === url ||
                    this.props.serviceId === serviceId
                ) {
                    this.setState({
                        src: data,
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

        resourceLoader.start();
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

        this.observer = new IntersectionObserver(callback, options);
        this.observer.observe(node);
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
        if (this.promise) {
            resourceLoader.remove(this.promise, this.srcUrl);
            this.promise = null;
            this.srcUrl = null;
        }

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

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
            backgroundImage: `url(${src})`,
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
