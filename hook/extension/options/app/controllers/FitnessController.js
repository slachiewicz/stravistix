app.controller("FitnessController", ['$scope', 'ChromeStorageService', 'NotifierService', '$timeout', '$location', function($scope, ChromeStorageService, NotifierService, $timeout, $location) {

    $scope.computedActivities = {};

    ChromeStorageService.fetchComputedActivities(function(computedActivities) {
        $scope.computedActivities = computedActivities;

        $scope.namesTrimpsArray = [];
        _.each(computedActivities, function (activity) {
            if(activity.extendedStats && activity.extendedStats.heartRateData) {
                // console.log(activity.name + ' ' + activity.extendedStats.heartRateData.TRIMP);
                $scope.namesTrimpsArray.push({
                    date: activity.start_date,
                    name: activity.name,
                    trimp: parseInt(activity.extendedStats.heartRateData.TRIMP.toFixed(0))
                });
            }
        });

        $scope.$apply();
    });

}]);
