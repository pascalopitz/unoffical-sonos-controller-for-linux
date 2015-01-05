function PlayPauseCtrl ($scope, port) {

	$scope.currentState = null;
	$scope.host = null;

	port.registerCallback(function(msg) {
		if(msg.type === 'currentState') {
			console.log('currentState', msg.state);
			$scope.currentState = msg.state || 'paused';
			$scope.host = msg.host;
			$scope.$apply();
		}
	});

	$scope.prev = function () {
		port.postMessage({
			type: 'prev',
			host: $scope.host
		});
	};

	$scope.next = function () {
		port.postMessage({
			type: 'next',
			host: $scope.host
		});
	};

	$scope.toggle = function () {
		var action = 'pause';

		if($scope.currentState === 'paused') {
			action = 'play';
		}

		port.postMessage({
			type: action,
			host: $scope.host
		});		
	};

}

export default PlayPauseCtrl;