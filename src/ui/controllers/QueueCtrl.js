function QueueCtrl ($scope, $rootScope, port, media) {

	$scope.tracks = [];

	port.registerCallback(function(msg) {
		if(msg.type === 'queue') {
			$scope.tracks = msg.result.items
			$scope.$apply();
		}
	});

	$scope.$watch('tracks', function(newValue) {

		if(!newValue || !newValue.length) {
			return;
		}

		$scope.tracks.forEach(function (t) {
			var albumArtURL = 'http://' + $rootScope.host + ':' + $rootScope.port + decodeURIComponent(t.albumArtURI);

			t.albumArtURL = '';

			media.urlToData(albumArtURL, function (data) {
				t.albumArtURL = data;
				$scope.$apply();	
			});

		});

	});

	$scope.play = function (item) {
		port.postMessage({
			type: 'play',
			item: item,
			host: $rootScope.host
		});		
	}

}

export default QueueCtrl;