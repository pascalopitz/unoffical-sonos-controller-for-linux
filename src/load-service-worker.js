navigator.serviceWorker
    .register('service-worker.js', {
        scope: '.'
    })
    .catch(function(err) {
        console.error('Error', err);
    });
