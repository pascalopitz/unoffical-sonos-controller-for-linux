const REG = /\.[jpg|jpeg|png|gif]$/gi;
const CACHE_NAME = 'images';

async function handleRequest(request) {
    try {
        const { url } = request;

        const response = await caches.match(request);

        if (response) {
            console.log('Cached hit', url);
            return response;
        }

        console.log('Cached miss', url);

        const req = new Request(url, { mode: 'no-cors' });
        const resp = await fetch(req);

        const cache = await caches.open(CACHE_NAME);
        cache.put(url, resp);

        console.log('Cached asset', url);

        return fetch(request);
    } catch (e) {
        console.error(e);
    }
}

self.addEventListener('fetch', function fetcher(event) {
    const { request } = event;
    const { url } = request;

    if (url.indexOf('x-file-cifs://') > -1 || url.match(REG)) {
        event.respondWith(handleRequest(request));
    }
});
