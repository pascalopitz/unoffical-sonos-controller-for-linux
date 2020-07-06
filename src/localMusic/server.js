import walk from 'walkdir';

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { parseFile } from 'music-metadata';
import { getType } from 'mime';
import { Helpers } from 'sonos';

import _ from 'lodash';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import Router from 'koa-router';

import {
    withinEnvelope,
    stripNamespaces,
    LOCAL_PORT,
    IP_ADDRESS,
} from '../common/helpers';

const ALLOWED_TYPES = [
    'audio/wma',
    'audio/x-ms-wma',
    'application/ogg',
    'audio/mp3',
    'audio/mpeg3',
    'audio/mpeg',
    'audio/flac',
    'audio/mp4',
    'audio/aac',
    'application/x-mpegURL',
    'application/vnd.apple.mpegURL',
    'audio/x-mpegurl',
];

let ROOT, server;

const statAsync = promisify(fs.stat).bind(fs);

const isDirectoryAsync = async (p) => {
    const stat = await statAsync(p);
    return stat.isDirectory();
};

const isFileAsync = async (p) => {
    const stat = await statAsync(p);
    return stat.isFile();
};

const isContained = (p) => {
    const relative = path.relative(ROOT, p);
    return relative.indexOf(`..${path.delimiter}`) === -1;
};

const isAllowedFile = async (p) => {
    return isContained(p) && (await isFileAsync(p));
};

const isAllowedDirectory = async (p) => {
    return isContained(p) && (await isDirectoryAsync(p));
};

class SoapError extends Error {}

const SmapiServer = {
    getMediaURI: async ({ id }) => {
        const pathEncoded = encodeURIComponent(id);
        const isFile = await isAllowedFile(path.resolve(ROOT, id));

        if (!isFile) {
            throw new SoapError('Invalid file');
        }

        return withinEnvelope(
            `<getMediaURIResponse>
                <getMediaURIResult>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</getMediaURIResult>
            </getMediaURIResponse>`
        );
    },

    getMetadata: async ({ id, index = 0, count = 100 }) => {
        let target;

        if (id === 'root') {
            target = ROOT;
        } else {
            const p = path.resolve(ROOT, id);
            const isDir = await isAllowedDirectory(p);

            if (!isDir) {
                throw new Error('Not allowed');
            }

            target = p;
        }

        if (!target) {
            throw new Error('Invalid target');
        }

        const allPaths = await walk.async(target, {
            no_recurse: true,
        });

        const resultXml = [];

        for (const p of allPaths) {
            try {
                const isDir = await isAllowedDirectory(p);
                const pathEncoded = encodeURIComponent(path.relative(ROOT, p));

                if (isDir) {
                    const title = path.basename(p);

                    resultXml.push(`<mediaCollection>
                    <id>${path.relative(ROOT, p)}</id>
                    <itemType>container</itemType>
                    <canPlay>false</canPlay>
                    <canEnumerate>true</canEnumerate>
                    <authRequired>false</authRequired>
                    <title>${title}</title>
                </mediaCollection>`);
                }

                const isFile = await isAllowedFile(p);
                const type = await getType(p);

                if (isFile && ALLOWED_TYPES.indexOf(type) !== -1) {
                    const info = await parseFile(p, { duration: true }).catch(
                        () => null
                    );

                    if (info) {
                        resultXml.push(`<mediaMetadata>
                            <parentID>${id}</parentID>
                            <id>${path.relative(ROOT, p)}</id>
                            <itemType>localFile</itemType>
                            <canPlay>true</canPlay>
                            <canEnumerate>false</canEnumerate>
                            <authRequired>false</authRequired>
                            <title>${info.common.title}</title>
                            <trackMetadata>
                                <artist>${info.common.artist}</artist>
                                <album>${info.common.album || ''}</album>
                                <duration>${parseInt(
                                    (info.format.duration || 0) * 1000,
                                    10
                                )}</duration>
                                <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                            </trackMetadata>
                            <mimeType>${type}</mimeType>
                            <uri>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</uri>
                        </mediaMetadata>`);
                    }
                }
            } catch (e) {
                console.error(e);
                // noop;
            }
        }

        return withinEnvelope(
            `<getMetadataResponse>
                <getMetadataResult>
                    <index>${index}</index>
                    <count>${resultXml.length}</count>
                    <total>${resultXml.length}</total>
                    ${resultXml.join('')}
                </getMetadataResult>
            </getMetadataResponse>`
        );
    },

    search: async ({ id, term, index = 0, count = 100 }) => {
        const allPaths = await walk.async(ROOT);

        const resultXml = [];

        for (const p of allPaths) {
            try {
                const isFile = await isAllowedFile(p);
                const type = await getType(p);

                if (isFile && ALLOWED_TYPES.indexOf(type) !== -1) {
                    const infoShallow = await parseFile(p, {
                        duration: false,
                    }).catch(() => null);

                    const match =
                        infoShallow &&
                        infoShallow.common[id] &&
                        infoShallow.common[id]
                            .toLowerCase()
                            .indexOf(term.toLowerCase()) !== -1;

                    if (match) {
                        const pathEncoded = encodeURIComponent(
                            path.relative(ROOT, p)
                        );
                        const info = await parseFile(p, {
                            duration: true,
                        }).catch(() => null);

                        resultXml.push(`<mediaMetadata>
                            <parentID></parentID>
                            <id>${path.relative(ROOT, p)}</id>
                            <itemType>localFile</itemType>
                            <canPlay>true</canPlay>
                            <canEnumerate>false</canEnumerate>
                            <authRequired>false</authRequired>
                            <title>${info.common.title}</title>
                            <trackMetadata>
                                <artist>${info.common.artist}</artist>
                                <album>${info.common.album || ''}</album>
                                <duration>${parseInt(
                                    (info.format.duration || 0) * 1000,
                                    10
                                )}</duration>
                                <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                            </trackMetadata>
                            <mimeType>${type}</mimeType>
                            <uri>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</uri>
                        </mediaMetadata>`);
                    }
                }
            } catch (e) {
                console.error(e);
                // noop;
            }
        }

        return withinEnvelope(
            `<searchResponse>
                <searchResult>
                    <index>${index}</index>
                    <count>${resultXml.length}</count>
                    <total>${resultXml.length}</total>
                    ${resultXml.join('')}
                </searchResult>
            </searchResponse>`
        );
    },
};

export const startServer = () => {
    if (server) {
        console.warn('Server already running');
        return;
    }

    const app = new Koa();
    const router = new Router();

    router.get('/albumArt/:p', async (ctx) => {
        const { params } = ctx;
        const p = path.resolve(ROOT, decodeURIComponent(params.p));
        const isFile = await isAllowedFile(p);

        if (!isFile) {
            throw new Error('Not a valid file');
        }

        const info = await parseFile(p);
        const picture = _.get(info, `common.picture[0]`);
        ctx.body = picture.data;
    });

    router.get('/track/:p', async (ctx) => {
        const { params } = ctx;
        const p = path.resolve(ROOT, decodeURIComponent(params.p));
        const isFile = await isAllowedFile(p);

        if (!isFile) {
            throw new Error('Not a valid file');
        }

        const type = await getType(p);
        const stream = fs.createReadStream(p);
        ctx.body = stream;
        ctx.response.set('content-type', type);
    });

    router.get('/presentation-map', async (ctx) => {
        ctx.response.set('content-type', 'text/xml');
        ctx.body = `<?xml version="1.0" encoding="utf-8" ?>
        <Presentation>
            <PresentationMap />
            <PresentationMap type="Search">
                <Match>
                    <SearchCategories>
                        <Category id="title" mappedId="title" />
                        <Category id="by artist" mappedId="artist" />
                        <Category id="on album" mappedId="album" />
                    </SearchCategories>
                </Match>
            </PresentationMap>
        </Presentation>`;
    });

    router.post('/smapi', async (ctx) => {
        const { headers, body } = ctx.request;

        if (headers.soapaction) {
            const parsed = await Helpers.ParseXml(stripNamespaces(body));

            const [, action] = JSON.parse(headers.soapaction).split('#');

            try {
                const xml = await SmapiServer[action](
                    _.get(parsed, `Envelope.Body.${action}`)
                );

                ctx.body = xml;
            } catch (e) {
                console.error(e);
                console.warn(`Action ${action} caused Error`, parsed);
            }
        }
    });

    app.use(async (ctx, next) => {
        if (!ROOT) {
            throw new Error(`No ROOT folder set`);
        }

        return next();
    });

    app.use(
        bodyParser({
            enableTypes: ['xml'],
        })
    );

    app.use(logger());
    app.use(router.routes());
    app.use(router.allowedMethods());

    server = app.listen(LOCAL_PORT);
};

export const handlePath = async (path) => {
    ROOT = path;
};

export const stopServer = async () => {
    if (!server) {
        console.warn('Server already stopped');
        return;
    }

    server.close();
    server = null;
};

const isSpawned = !!process.send;

if (!isSpawned) {
    ROOT = process.env.HOME + '/Music';
    startServer();
}
