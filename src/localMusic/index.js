import path from 'path';
import { fork } from 'child_process';

const indexer = fork(path.resolve(__dirname, './bridge.js'));

indexer.on('error', console.error);

indexer.on('message', (m) => {
    console.log('PARENT got message:', m);
});

export default {
    handlePath(DIR) {
        indexer.send({ type: 'path', payload: [DIR] });
    },

    startServer() {
        indexer.send({ type: 'start' });
    },

    stopServer() {
        indexer.send({ type: 'stop' });
    },
};
