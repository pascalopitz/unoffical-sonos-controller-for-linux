function ZoneListCtrl ($scope, port) {

	$scope.selectedGroup = null;
	$scope.ZoneGroups = [];

	port.registerCallback(function(msg) {
		if(msg.type === 'topology') {
			$scope.ZoneGroups = msg.state.ZoneGroups.ZoneGroup;

			if(!$scope.selectedGroup && $scope.ZoneGroups.length) {
				$scope.selectedGroup = $scope.ZoneGroups[0]
			}

			$scope.$apply();
		}
	});

	$scope.$watch('ZoneGroups', function (newValue, oldValue) {
		console.log('ZoneGroups updated', newValue);
	});

	$scope.$watch('selectedGroup', function (newValue, oldValue) {
		console.log('ZoneGroups selection updated', newValue);

		if(newValue && newValue.$.ID) {
			port.postMessage({
				type: 'selectZoneGroup',
				ZoneGroup: newValue
			});
		}
	});

	$scope.select = function (group) {
		console.log('selected', group);
		$scope.selectedGroup = group;
	};

}

export default ZoneListCtrl;