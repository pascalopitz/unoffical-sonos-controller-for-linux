import path from 'path';
import { fork } from 'child_process';

import {
    SERVER_SET_PATH,
    SERVER_START,
    SERVER_STOP,
    SERVER_UNLOAD_DB,
    INDEXER_FINISHED,
} from './commands';

const server = fork(path.resolve(__dirname, './server.js'));

server.on('error', console.error);

server.on('message', (m) => {
    console.log('Server sent message:', m);
});

export default {
    indexPath(DIR) {
        const indexer = fork(path.resolve(__dirname, './db.js'), [DIR]);

        indexer.on('error', console.error);

        indexer.on('message', (m) => {
            if (m.type === INDEXER_FINISHED) {
                server.send({ type: SERVER_UNLOAD_DB });
            }
        });
    },

    handlePath(DIR) {
        server.send({ type: SERVER_SET_PATH, payload: [DIR] });
    },

    startServer() {
        server.send({ type: SERVER_START });
    },

    stopServer() {
        server.send({ type: SERVER_STOP });
    },

    kill() {
        if (server && server.pid) {
            console.log('killing server');
            process.kill(server.pid);
        }
    },
};
