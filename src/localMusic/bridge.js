import { handlePath, startServer, stopServer } from './server';

process.on('message', ({ type, payload }) => {
    switch (type) {
        case 'path':
            const [DIR] = payload;
            handlePath(DIR);
            break;
        case 'start':
            startServer();
            break;
        case 'stop':
            stopServer();
            break;
        default:
            console.log('ignored', { type, payload });
    }
});
