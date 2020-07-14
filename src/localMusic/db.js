import path from 'path';
import initSqlJs from 'sql.js';
import walk from 'walkdir';
import _ from 'lodash';

import { parseFile } from 'music-metadata';
import { getType } from 'mime';

import { ALLOWED_TYPES } from './common';

import { isFileAsync, writeFileAsync } from './helpers';
import { INDEXER_FINISHED, INDEXER_STARTED } from './commands';

const createIndex = async (rootFolder) => {
    console.log(`Beginning to index ${rootFolder}`);
    process.send({ type: INDEXER_STARTED });

    const SQL = await initSqlJs();
    const db = new SQL.Database();

    db.run(
        `CREATE TABLE tracks (
            path text PRIMARY KEY,
            folder,
            artist text,
            title text,
            album text,
            mimeType text,
            duration float,
            lastIndexed date
        );`
    );

    const end = async () => {
        const data = db.export();
        await writeFileAsync(
            path.resolve(__dirname, '../localMusic.sqlite'),
            Buffer.from(data)
        );

        console.log(`Done indexing ${rootFolder}`);
        process.send({ type: INDEXER_FINISHED });
    };

    let ended = false;
    let currentlyReadingCount = 0;

    const emitter = walk(rootFolder, {
        no_recurse: false,
        follow_symlinks: true,
        no_return: true,
    });

    emitter.on('file', async (filename) => {
        currentlyReadingCount++;

        try {
            const isFile = await isFileAsync(filename);

            if (isFile) {
                const mimeType = getType(filename);

                if (ALLOWED_TYPES.indexOf(mimeType) !== -1) {
                    console.log(`Indexing`, filename);

                    const pathRelative = path.relative(rootFolder, filename);
                    const folderPathRelative = path.relative(
                        rootFolder,
                        path.dirname(filename)
                    );

                    const info = await parseFile(filename, {
                        duration: true,
                    }).catch(() => null);

                    if (!!_.get(info, 'format.tagTypes', []).length) {
                        db.run(
                            `INSERT INTO tracks (
                            mimeType,
                            path,
                            folder,
                            artist,
                            title,
                            album,
                            duration,
                            lastIndexed
                        ) VALUES (
                            ?,?,?,?,?,?,?,?
                        );`,
                            [
                                mimeType,
                                pathRelative,
                                folderPathRelative,
                                info.common.artist || '',
                                info.common.title || '',
                                info.common.album || '',
                                Number(info.format.duration) || 0,
                                Date.now(),
                            ]
                        );
                    } else {
                        const title = path.basename(filename);

                        db.run(
                            `INSERT INTO tracks (
                            mimeType,
                            path,
                            folder,
                            artist,
                            title,
                            album,
                            duration,
                            lastIndexed
                        ) VALUES (
                            ?,?,?,?,?,?,?,?
                        );`,
                            [
                                mimeType,
                                pathRelative,
                                folderPathRelative,
                                '',
                                title,
                                '',
                                0,
                                Date.now(),
                            ]
                        );
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }

        currentlyReadingCount--;

        if (!currentlyReadingCount && ended) {
            await end();
        }
    });

    emitter.on('end', async () => {
        ended = true;

        if (!currentlyReadingCount) {
            await end();
        }
    });
};

const [DIR] = process.argv.reverse();
createIndex(DIR);
