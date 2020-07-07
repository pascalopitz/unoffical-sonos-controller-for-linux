import fs from 'fs';
import { promisify } from 'util';

export const statAsync = promisify(fs.stat).bind(fs);
export const readFileAsync = promisify(fs.readFile).bind(fs);
export const writeFileAsync = promisify(fs.writeFile).bind(fs);

export const isFileAsync = async (p) => {
    const stat = await statAsync(p);
    return stat.isFile();
};

export const isDirectoryAsync = async (p) => {
    const stat = await statAsync(p);
    return stat.isDirectory();
};
