navigator.serviceWorker
    .register('service-worker.js', {
        scope: '.'
    })
    .then(function(sw) {
        console.log('Registered!', sw);
        console.log(
            'You should get a different response when you refresh the page.'
        );
    })
    .catch(function(err) {
        console.error('Error', err);
    });
