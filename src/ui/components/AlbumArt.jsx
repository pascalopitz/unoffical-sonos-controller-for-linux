import _ from 'lodash';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import SonosService from '../services/SonosService';
import { getByServiceId } from '../services/MusicServiceClient';

import useIsInViewport from 'use-is-in-viewport';

import getServiceLogoUrl from '../helpers/getServiceLogoUrl';

const loadCache = new Map();

async function chachedOrfetch(src) {
    if (loadCache.has(src)) {
        return loadCache.get(src);
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onload = resolve;
        image.onerror = reject;
    }).then(() => {
        return src;
    });
}

export const AlbumArt = (props) => {
    const { src: propsSrc, viewportRef: viewport, serviceId } = props;

    const targetRef = useRef();
    const [visible, setViewportChildRef] = useIsInViewport({
        viewport,
        modTop: '60px',
        modBottom: '60px',
    });

    const [src, setSrc] = useState(null);
    const [loadedSrc, setLoadedSrc] = useState(null);
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadError = useCallback(() => {
        if (!visible) {
            return;
        }

        (async () => {
            try {
                const urlToParse = propsSrc.match(/^\//)
                    ? `http://localhost${propsSrc}`
                    : propsSrc;

                const parsed = new URL(
                    new URL(urlToParse).searchParams.get('u')
                );

                const sid = parsed.searchParams.get('sid');

                if (!sid) {
                    throw new Error(`No service id`);
                }

                const client = getByServiceId(sid);

                if (!client) {
                    throw new Error(`No service client`);
                }

                const response = await client.getExtendedMetadata(
                    decodeURIComponent(parsed.pathname).replace('.mp3', '')
                );

                const newSrc = _.get(
                    response,
                    'mediaMetadata.trackMetadata.albumArtURI'
                );

                if (
                    targetRef.current &&
                    targetRef.current.getAttribute('data-src-computed') === src
                ) {
                    setSrc(newSrc);
                }
            } catch (e) {
                setFailed(true);
                setLoaded(false);
                setLoading(false);
            }
        })();
    }, [
        src,
        propsSrc,
        visible,
        loading,
        failed,
        setSrc,
        setLoading,
        setLoaded,
        setFailed,
    ]);

    const loadSuccess = useCallback(
        (imageSrc, blobSrc) => {
            if (
                targetRef &&
                src &&
                visible &&
                targetRef.current.getAttribute('data-src-computed') === src
            ) {
                loadCache.set(imageSrc, blobSrc);
                loadCache.set(propsSrc, blobSrc);
                loadCache.set(src, blobSrc);

                setLoadedSrc(blobSrc);
                setLoading(false);
                setLoaded(true);
            }
        },
        [
            src,
            propsSrc,
            visible,
            setLoadedSrc,
            setLoading,
            setLoaded,
            targetRef.current,
        ]
    );

    const loadImage = useCallback(
        (imageSrc) => {
            setLoading(true);
            chachedOrfetch(imageSrc)
                .then((blobSrc) => {
                    loadSuccess(imageSrc, blobSrc);
                })
                .catch(loadError);
        },
        [propsSrc, visible, src]
    );

    useEffect(() => {
        if (!src || failed) {
            setLoadedSrc(null);
            return;
        }

        loadImage(src);
    }, [src, failed]);

    useEffect(() => {
        if (!visible) {
            setFailed(false);
            setLoading(false);
            setLoaded(false);
            setSrc(null);
            setLoadedSrc(null);
        } else {
            const url =
                propsSrc && typeof propsSrc === 'object' && propsSrc._
                    ? propsSrc._
                    : serviceId
                    ? getServiceLogoUrl(serviceId)
                    : propsSrc;

            if (url && typeof url === 'string') {
                const sonos = SonosService._currentDevice;

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

                setFailed(false);
                setLoading(false);
                setLoaded(false);
                setSrc(srcUrl);
                setLoadedSrc(null);
            } else {
                setFailed(false);
                setLoading(false);
                setLoaded(true);
                setSrc(null);
                setLoadedSrc(null);
            }
        }
    }, [
        propsSrc,
        serviceId,
        visible,
        setLoading,
        setLoaded,
        setFailed,
        setSrc,
    ]);

    const srcUrl = loadedSrc
        ? loadedSrc
        : 'images/browse_missing_album_art.png';

    const css = {
        backgroundImage: `url("${srcUrl}")`,
        backgroundSize: 'contain',
    };

    return (
        <div
            ref={(r) => {
                targetRef.current = r;
                setViewportChildRef(r);
            }}
            className="img"
            style={css}
            data-visible={visible}
            data-loading={loading}
            data-loaded={loaded}
            data-failed={failed}
            data-src-computed={src}
            data-src-prop={propsSrc}
        />
    );
};

export default AlbumArt;
