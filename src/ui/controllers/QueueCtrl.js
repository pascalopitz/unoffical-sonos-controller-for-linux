function QueueCtrl ($scope, $rootScope, port, media) {

	$scope.tracks = [];

	port.registerCallback(function(msg) {
		if(msg.type === 'queue') {
			$scope.tracks = msg.result.items
			$scope.$apply();
		}
	});

	$scope.$watch('tracks', function(newValue) {

		var timer;

		if(!newValue || !newValue.length) {
			return;
		}

		$scope.tracks.forEach(function (t) {
			var albumArtURL = 'http://' + $rootScope.host + ':' + $rootScope.port + decodeURIComponent(t.albumArtURI);

			t.albumArtURL = '';

			media.urlToData(albumArtURL, function (data) {
				t.albumArtURL = data;

				if(timer) {
					window.clearTimeout(timer);
				}

				timer = window.setTimeout(function () {
					$scope.$apply();
				}, 1);	
			});

		});

	});

	$scope.goto = function (item) {
		port.postMessage({
			type: 'goto',
			target: item,
			host: $rootScope.host
		});		
	}

}

export default QueueCtrl;