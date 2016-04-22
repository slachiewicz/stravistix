app.controller("FitnessController", ['$scope', 'ChromeStorageService', 'NotifierService', '$timeout', '$location', function($scope, ChromeStorageService, NotifierService, $timeout, $location) {

    $scope.computedActivities = {};

    ChromeStorageService.fetchComputedActivities(function(computedActivities) {
        $scope.computedActivities = computedActivities;
        $scope.$apply();
    });
    
}]);
