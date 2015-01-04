var port = chrome.runtime.connect({name: "ui"});

var app = angular.module('Sonos', []);

angular.module('Sonos').controller('ZoneListCtrl', function ($scope) {

	$scope.selectedGroup = null;
	$scope.ZoneGroups = [];

	port.onMessage.addListener(function(msg) {
		if(msg.type === 'topology') {
			$scope.ZoneGroups = msg.state.ZoneGroups.ZoneGroup;

			if(!$scope.selectedGroup && $scope.ZoneGroups.length) {
				$scope.selectedGroup = $scope.ZoneGroups[0]
			}

			$scope.$apply();
		}
	});

	$scope.select = function (group) {
		$scope.selectedGroup = group;
	};

});