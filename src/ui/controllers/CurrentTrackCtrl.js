function CurrentTrackCtrl ($scope, port, media) {

	port.registerCallback(function(msg) {
		if(msg.type === 'currentTrack') {
			$scope.track = msg.track;
			var url = $scope.track.albumArtURL;

			delete $scope.track.albumArtURL;

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