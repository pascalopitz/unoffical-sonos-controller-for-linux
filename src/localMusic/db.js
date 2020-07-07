import path from 'path';

import initSqlJs from 'sql.js';

import walk from 'walkdir';

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

    const fileNames = await walk.async(rootFolder, {
        no_recurse: false,
    });

    for (const filename of fileNames) {
        try {
            const isFile = await isFileAsync(filename);

            if (!isFile) {
                continue;
            }

            const mimeType = getType(filename);

            if (ALLOWED_TYPES.indexOf(mimeType) === -1) {
                continue;
            }

            const pathRelative = path.relative(rootFolder, filename);
            const folderPathRelative = path.relative(
                rootFolder,
                path.dirname(filename)
            );

            const info = await parseFile(filename, {
                duration: true,
            }).catch(() => null);

            if (!info) {
                continue;
            }

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
        } catch (err) {
            console.error(err);
        }
    }

    const data = db.export();
    await writeFileAsync(
        path.resolve(__dirname, '../localMusic.sqlite'),
        Buffer.from(data)
    );

    console.log(`Done indexing ${rootFolder}`);
    process.send({ type: INDEXER_FINISHED });
};

const [DIR] = process.argv.reverse();
createIndex(DIR);
