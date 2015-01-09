function BrowserCtrl ($scope, $rootScope, port, media) {

	$scope.sources = [
		{
			title: 'Sonos Favourites',
			mode: 'favourites'
		},
		{
			title: 'Music Library',
			mode: 'library'
		}
	];

	$scope.searchTypes = [
		{
			title: 'Artists',
			mode: 'artists'
		},
		{
			title: 'Albums',
			mode: 'albums'
		},
		{
			title: 'Composers',
			mode: 'composers'
		},
		{
			title: 'Genres',
			mode: 'genres'
		},
		{
			title: 'Tracks',
			mode: 'tracks'
		},
		{
			title: 'Playlists',
			mode: 'playlists'
		}
	];

	$scope.title = 'Select a Music Source';
	$scope.mode = 'sources';

	$scope.searchMode = null;

	port.registerCallback(function(msg) {
		if(msg.type === 'browse') {
			$scope.items = msg.result.items
			$scope.$apply();
		}
	});

	$scope.$watch('items', function(newValue) {

		var timer;

		if(!newValue || !newValue.length) {
			return;
		}

		$scope.items.forEach(function (t) {
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

	$scope.setSource = function (s) {
		$scope.title = s.title;
		$scope.items = [];
		$scope.mode = s.mode;
	}

	$scope.setSearchType = function (s) {
		$scope.title = s.title;
		$scope.items = [];
		$scope.searchMode = s.mode;
	}

	$scope.$watch('searchMode', function (newValue, oldValue) {
		if(newValue && newValue != oldValue) {		
			port.postMessage({
				type: 'browse',
				searchMode: $scope.searchMode,
				host: $rootScope.host
			});
		}
	});

}

export default BrowserCtrl;