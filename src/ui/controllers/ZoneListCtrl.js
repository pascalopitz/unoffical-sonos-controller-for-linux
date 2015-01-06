function ZoneListCtrl ($scope, $rootScope, $filter, port) {

	$scope.selectedGroup = null;
	$scope.ZoneGroups = [];

	var orderBy = $filter('orderBy');

	port.registerCallback(function(msg) {
		if(msg.type === 'topology') {
			$scope.ZoneGroups = msg.state.ZoneGroups.ZoneGroup;

			// sort rooms alpha 
			$scope.ZoneGroups.forEach(function (g) {
				g.ZoneGroupMember = orderBy(g.ZoneGroupMember, 'title', false);
				g.title = g.ZoneGroupMember[0].$.ZoneName+ ((g.ZoneGroupMember.length > 1) ? ' + ' + (g.ZoneGroupMember.length - 1) :  '');
			});

			// sort groups aplpha
			$scope.ZoneGroups = orderBy($scope.ZoneGroups, 'title', false);

			if(!$scope.selectedGroup && $scope.ZoneGroups.length) {
				$scope.selectedGroup = $scope.ZoneGroups[0];
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