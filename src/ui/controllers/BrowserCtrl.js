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
			mode: 'artist'
		},
		{
			title: 'Albums',
			mode: 'album'
		},
		{
			title: 'Composers',
			mode: 'composer'
		},
		{
			title: 'Genres',
			mode: 'genre'
		},
		{
			title: 'Tracks',
			mode: 'track'
		}
	];

	$scope.title = 'Select a Music Source';
	$scope.mode = 'sources';

	$scope.searchMode = null;

	$scope.setSource = function (s) {
		$scope.title = s.title;
		$scope.mode = s.mode;
	}

	$scope.setSearchType = function (s) {
		$scope.title = s.title;
		$scope.searchMode = s.mode;
	}

}

export default BrowserCtrl;