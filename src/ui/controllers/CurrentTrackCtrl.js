function CurrentTrackCtrl ($scope, $rootScope, port, media) {

	port.registerCallback(function(msg) {
		if(msg.type === 'currentTrack') {

			console.log('currentTrack', msg.track);

			$scope.track = msg.track;
			var url = $scope.track.albumArtURL;

			$scope.track.albumArtURL = '';

			if(url) {
				media.urlToData(url, function (data) {
					$scope.track.albumArtURL = data;
					$scope.$apply();	
				});
			}

			$scope.$apply();
		}
	});

}

export default CurrentTrackCtrl;