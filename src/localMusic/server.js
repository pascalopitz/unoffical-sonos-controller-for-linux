import walk from 'walkdir';

import fs from 'fs';
import path from 'path';

import initSqlJs from 'sql.js';

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

import { ALLOWED_TYPES } from './common';
import {
    SERVER_SET_PATH,
    SERVER_START,
    SERVER_STOP,
    SERVER_UNLOAD_DB,
} from './commands';

let ROOT, server, smapiInstance;

import {
    isDirectoryAsync,
    isFileAsync,
    readFileAsync,
    realpathAsync,
} from './helpers';

// NOTE: this doesn't work for symlinks
// find a better way
// const isContained = (p) => {
//     const relative = path.relative(ROOT, p);
//     return relative.indexOf(`..`) === -1;
// };

const isAllowedFile = async (p) => {
    const type = await getType(p);
    const isFile = await isFileAsync(p);
    return isFile && ALLOWED_TYPES.indexOf(type) !== -1;
};

const isAllowedDirectory = async (p) => {
    return await isDirectoryAsync(p);
};

const __escape = (str) => _.escape(str);

class SoapError extends Error {}

const ID_REG = /^container\-(\w+)\-(.*)/;

class SmapiServer {
    async _getDB() {
        if (this._db) {
            return this._db;
        }
        const buffer = await readFileAsync(
            path.resolve(__dirname, '../localMusic.sqlite')
        );
        const SQL = await initSqlJs();
        const db = new SQL.Database(buffer);
        this._db = db;

        console.log('Loaded DB');

        return db;
    }

    async unloadDb() {
        console.log('Unloaded DB');
        this._db = null;
    }

    async getMediaURI({ id }) {
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
    }

    async _getArtistMetaData({ value, count, index }) {
        const db = await this._getDB();

        const countQuery = db.exec(
            `SELECT COUNT(*) FROM (
                SELECT album, artist, path FROM tracks
                WHERE artist LIKE :value
                GROUP BY album
            );`,
            {
                ':value': value,
            }
        );
        const query = db.exec(
            `SELECT album, artist, path FROM tracks
             WHERE artist LIKE :value
             GROUP BY album
             LIMIT :count OFFSET :index;`,
            {
                ':count': count,
                ':index': index,
                ':value': value,
            }
        );

        const total = _.get(countQuery, '0.values.0.0', 0);
        const resultXml = [];

        if (query.length > null) {
            const [{ values }] = query;

            for (const value of values) {
                const [album, artist, pathRelative] = value;

                const pathEncoded = encodeURIComponent(pathRelative);

                resultXml.push(`
                    <mediaCollection>
                        <id>container-album-${__escape(album)}</id>
                        <itemType>local-album</itemType>
                        <canPlay>false</canPlay>
                        <canEnumerate>true</canEnumerate>
                        <authRequired>false</authRequired>
                        <artist>${__escape(artist)}</artist>
                        <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                        <title>${__escape(album)}</title>
                    </mediaCollection>
                `);
            }
        }

        return withinEnvelope(`
            <getMetadataResponse>
                <getMetadataResult>
                    <index>${index}</index>
                    <count>${resultXml.length}</count>
                    <total>${total}</total>
                    ${resultXml.join('')}
                </getMetadataResult>
            </getMetadataResponse>
        `);
    }

    async _getAlbumMetaData({ value, count, index }) {
        const db = await this._getDB();

        const countQuery = db.exec(
            `SELECT COUNT(*) FROM (
                SELECT * FROM tracks
                WHERE album LIKE :value
            );`,
            {
                ':value': value,
            }
        );
        const query = db.exec(
            `SELECT * FROM tracks
             WHERE album LIKE :value
             LIMIT :count OFFSET :index;`,
            {
                ':count': count,
                ':index': index,
                ':value': value,
            }
        );

        const total = _.get(countQuery, '0.values.0.0', 0);
        const resultXml = [];

        if (query.length > null) {
            const [{ values }] = query;

            for (const value of values) {
                const [
                    pathRelative,
                    folderPathRelative,
                    artist,
                    title,
                    album,
                    mimeType,
                    duration,
                ] = value;

                const pathEncoded = encodeURIComponent(pathRelative);

                resultXml.push(`
                    <mediaMetadata>
                        <parentID>${folderPathRelative}</parentID>
                        <id>${pathRelative}</id>
                        <itemType>local-file</itemType>
                        <canPlay>true</canPlay>
                        <canEnumerate>false</canEnumerate>
                        <authRequired>false</authRequired>
                        <title>${__escape(title)}</title>
                        <trackMetadata>
                            <artist>${__escape(artist)}</artist>
                            <album>${__escape(album || '')}</album>
                            <duration>${parseInt(
                                (duration || 0) * 1000,
                                10
                            )}</duration>
                            <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                        </trackMetadata>
                        <mimeType>${mimeType}</mimeType>
                        <uri>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</uri>
                    </mediaMetadata>
                `);
            }

            return withinEnvelope(`
                <getMetadataResponse>
                    <getMetadataResult>
                        <index>${index}</index>
                        <count>${resultXml.length}</count>
                        <total>${total}</total>
                        ${resultXml.join('')}
                    </getMetadataResult>
                </getMetadataResponse>
            `);
        }
    }

    async _getPathMetaData({ id, index }) {
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

        const realTarget = await realpathAsync(target);

        const allPaths = await walk.async(realTarget, {
            no_recurse: true,
            follow_symlinks: false,
            return_object: false,
        });

        const resultXml = [];

        for (const p of allPaths) {
            try {
                const isDir = await isAllowedDirectory(p);
                const isFile = await isAllowedFile(p);
                const pathID = path.relative(ROOT, p);
                const pathEncoded = encodeURIComponent(pathID);
                if (isDir) {
                    const title = path.basename(p);

                    resultXml.push(`
                        <mediaCollection>
                            <id>${pathID}</id>
                            <itemType>container</itemType>
                            <canPlay>false</canPlay>
                            <canEnumerate>true</canEnumerate>
                            <authRequired>false</authRequired>
                            <title>${__escape(title)}</title>
                        </mediaCollection>
                    `);
                } else if (isFile) {
                    const type = await getType(p);

                    const info = await parseFile(p, {
                        duration: true,
                    }).catch(() => null);

                    if (_.get(info, 'format.tagTypes', []).length) {
                        resultXml.push(`
                            <mediaMetadata>
                                <parentID>${id}</parentID>
                                <id>${pathID}</id>
                                <itemType>local-file</itemType>
                                <canPlay>true</canPlay>
                                <canEnumerate>false</canEnumerate>
                                <authRequired>false</authRequired>
                                <title>${__escape(info.common.title)}</title>
                                <trackMetadata>
                                    <artist>${__escape(
                                        info.common.artist
                                    )}</artist>
                                    <album>${__escape(
                                        info.common.album || ''
                                    )}</album>
                                    <duration>${parseInt(
                                        (info.format.duration || 0) * 1000,
                                        10
                                    )}</duration>
                                    <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                                </trackMetadata>
                                <mimeType>${type}</mimeType>
                                <uri>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</uri>
                            </mediaMetadata>
                        `);
                    } else {
                        const title = path.basename(p);

                        if (!title.match(/^\./)) {
                            resultXml.push(`
                            <mediaMetadata>
                                <parentID>${id}</parentID>
                                <id>${pathID}</id>
                                <itemType>local-file</itemType>
                                <canPlay>true</canPlay>
                                <canEnumerate>false</canEnumerate>
                                <authRequired>false</authRequired>
                                <title>${__escape(title)}</title>
                                <trackMetadata>
                                    <artist></artist>
                                    <album></album>
                                </trackMetadata>
                                <mimeType>${type}</mimeType>
                                <uri>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</uri>
                            </mediaMetadata>
                        `);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                // noop;
            }
        }

        if (resultXml.length <= index) {
            return withinEnvelope(
                `<getMetadataResponse>
                    <getMetadataResult>
                        <index>${index}</index>
                        <count>0</count>
                        <total>${resultXml.length}</total>
                    </getMetadataResult>
                </getMetadataResponse>`
            );
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
    }

    async getMetadata({ id, index = 0, count = 100 }) {
        const [, type, value = ''] = ID_REG.exec(id) || [];

        if (type && value && type === 'artist') {
            return this._getArtistMetaData({ value, count, index });
        }

        if (type && value && type === 'album') {
            return this._getAlbumMetaData({ value, count, index });
        }

        return this._getPathMetaData({ id, index, count });
    }

    async _searchTracks({ term, index = 0, count = 100 }) {
        const db = await this._getDB();
        const resultXml = [];

        const countQuery = db.exec(
            `SELECT COUNT(*) FROM (
                SELECT * FROM tracks
                WHERE title LIKE :term
            );`,
            {
                ':term': `%${term}%`,
            }
        );
        const query = db.exec(
            `SELECT * FROM tracks
             WHERE title LIKE :term
             LIMIT :count OFFSET :index;`,
            {
                ':count': count,
                ':index': index,
                ':term': `%${term}%`,
            }
        );

        const total = _.get(countQuery, '0.values.0.0', 0);

        if (query.length > null) {
            const [{ values }] = query;

            for (const value of values) {
                const [
                    pathRelative,
                    folderPathRelative,
                    artist,
                    title,
                    album,
                    mimeType,
                    duration,
                ] = value;

                const pathEncoded = encodeURIComponent(pathRelative);

                resultXml.push(`
                    <mediaMetadata>
                        <parentID>${folderPathRelative}</parentID>
                        <id>${pathRelative}</id>
                        <itemType>local-file</itemType>
                        <canPlay>true</canPlay>
                        <canEnumerate>false</canEnumerate>
                        <authRequired>false</authRequired>
                        <title>${__escape(title)}</title>
                        <trackMetadata>
                            <artist>${__escape(artist)}</artist>
                            <album>${__escape(album || '')}</album>
                            <duration>${parseInt(
                                (duration || 0) * 1000,
                                10
                            )}</duration>
                            <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                        </trackMetadata>
                        <mimeType>${mimeType}</mimeType>
                        <uri>http://${IP_ADDRESS}:${LOCAL_PORT}/track/${pathEncoded}</uri>
                    </mediaMetadata>
                `);
            }
        }

        return withinEnvelope(
            `<searchResponse>
                <searchResult>
                    <index>${index}</index>
                    <count>${resultXml.length}</count>
                    <total>${total}</total>
                    ${resultXml.join('')}
                </searchResult>
            </searchResponse>`
        );
    }

    async _searchArtists({ term, index = 0, count = 100 }) {
        const db = await this._getDB();
        const resultXml = [];

        const countQuery = db.exec(
            `SELECT COUNT(*) FROM (
                SELECT artist FROM tracks
                WHERE artist LIKE :term
                GROUP BY artist
            );`,
            {
                ':term': `%${term}%`,
            }
        );
        const query = db.exec(
            `SELECT artist FROM tracks
             WHERE artist LIKE :term
             GROUP BY artist
             LIMIT :count OFFSET :index;`,
            {
                ':count': count,
                ':index': index,
                ':term': `%${term}%`,
            }
        );

        const total = _.get(countQuery, '0.values.0.0', 0);

        if (query.length > null) {
            const [{ values }] = query;

            for (const value of values) {
                const [artist] = value;

                resultXml.push(`
                    <mediaCollection>
                        <id>container-artist-${__escape(artist)}</id>
                        <itemType>local-artist</itemType>
                        <canPlay>false</canPlay>
                        <canEnumerate>true</canEnumerate>
                        <authRequired>false</authRequired>
                        <title>${__escape(artist)}</title>
                    </mediaCollection>
                `);
            }
        }

        return withinEnvelope(
            `<searchResponse>
                <searchResult>
                    <index>${index}</index>
                    <count>${resultXml.length}</count>
                    <total>${total}</total>
                    ${resultXml.join('')}
                </searchResult>
            </searchResponse>`
        );
    }

    async _searchAlbums({ term, index = 0, count = 100 }) {
        const db = await this._getDB();
        const resultXml = [];

        const countQuery = db.exec(
            `SELECT COUNT(*) FROM (
                SELECT album, artist, path FROM tracks
                WHERE album LIKE :term
                GROUP BY album
            );`,
            {
                ':term': `%${term}%`,
            }
        );
        const query = db.exec(
            `SELECT album, artist, path FROM tracks
             WHERE album LIKE :term
             GROUP BY album
             LIMIT :count OFFSET :index;`,
            {
                ':count': count,
                ':index': index,
                ':term': `%${term}%`,
            }
        );

        const total = _.get(countQuery, '0.values.0.0', 0);

        if (query.length > null) {
            const [{ values }] = query;

            for (const value of values) {
                const [album, artist, pathRelative] = value;

                const pathEncoded = encodeURIComponent(pathRelative);

                resultXml.push(`
                    <mediaCollection>
                        <id>container-album-${__escape(album)}</id>
                        <itemType>local-album</itemType>
                        <canPlay>false</canPlay>
                        <canEnumerate>true</canEnumerate>
                        <authRequired>false</authRequired>
                        <artist>${__escape(artist)}</artist>
                        <album>${__escape(album || '')}</album>
                        <albumArtURI>http://${IP_ADDRESS}:${LOCAL_PORT}/albumArt/${pathEncoded}</albumArtURI>
                        <title>${__escape(album)}</title>
                    </mediaCollection>
                `);
            }
        }

        return withinEnvelope(
            `<searchResponse>
                <searchResult>
                    <index>${index}</index>
                    <count>${resultXml.length}</count>
                    <total>${total}</total>
                    ${resultXml.join('')}
                </searchResult>
            </searchResponse>`
        );
    }

    async search({ id, term, index = 0, count = 100 }) {
        if (id === 'artist') {
            return this._searchArtists({ id, term, index, count });
        }

        if (id === 'album') {
            return this._searchAlbums({ id, term, index, count });
        }

        if (id === 'title') {
            return this._searchTracks({ id, term, index, count });
        }

        throw new Error('Invalid ID');
    }
}

const startServer = () => {
    if (server) {
        console.warn('Server already running');
        return;
    }

    console.log('Server starting');

    smapiInstance = new SmapiServer();

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

        if (picture) {
            ctx.body = picture.data;
        } else {
            ctx.status = 404;
        }
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
                        <Category id="Tracks" mappedId="title" />
                        <Category id="Artists" mappedId="artist" />
                        <Category id="Albums" mappedId="album" />
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
                const xml = await smapiInstance[action](
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

    app.on('error', (err, ctx) => {
        console.error('server error', err, ctx);
    });

    server = app.listen(LOCAL_PORT);
};

const handlePath = async (path) => {
    if (!path) {
        return;
    }

    console.log('Handle new path', path);

    const isDir = await isDirectoryAsync(path);

    if (!isDir) {
        throw new Error('invalid target dir');
    }

    ROOT = path;
};

const stopServer = async () => {
    try {
        if (server) {
            console.log('Server stopping');
            server.close();
        }
    } catch (e) {
        console.warn(e);
    }

    server = null;
    smapiInstance = null;
};

process.on('message', ({ type, payload }) => {
    switch (type) {
        case SERVER_SET_PATH:
            const [DIR] = payload;
            handlePath(DIR);
            break;
        case SERVER_START:
            startServer();
            break;
        case SERVER_STOP:
            stopServer();
            break;
        case SERVER_UNLOAD_DB:
            if (smapiInstance) {
                smapiInstance.unloadDb();
            }
            break;
        default:
            console.log('ignored', { type, payload });
    }
});

process.on('SIGTERM', () => {
    console.log('Terminated server');
    process.exit();
});
