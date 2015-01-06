function PlayPauseCtrl ($scope, $rootScope, port) {

	$scope.currentState = null;
	$scope.host = null;

	port.registerCallback(function(msg) {
		if(msg.type === 'currentState') {
			console.log('currentState', msg.state);
			$scope.currentState = msg.state || 'paused';
			$rootScope.host = msg.host;
			$rootScope.port = msg.port;
			$scope.$apply();
			$rootScope.$apply();
		}
	});

	$scope.prev = function () {
		port.postMessage({
			type: 'prev',
			host: $rootScope.host
		});
	};

	$scope.next = function () {
		port.postMessage({
			type: 'next',
			host: $rootScope.host
		});
	};

	$scope.toggle = function () {
		var action = 'pause';

		if($scope.currentState === 'paused') {
			action = 'play';
		}

		port.postMessage({
			type: action,
			host: $rootScope.host
		});
	};

}

export default PlayPauseCtrl;