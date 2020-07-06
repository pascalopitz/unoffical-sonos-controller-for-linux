import { SnapDB } from 'snap-db';

export const db = new SnapDB('local_music');

export const startDB = async () => {
    return await db.ready();
};
