app.directive('fitnessTrendTable', ['$timeout', '$location', 'FitnessDataService', function($timeout, $location, fitnessDataService) {

    // var linkFunction = function($scope, element, attrs) {};
    var controllerFunction = function($scope) {
        // $scope.query = {
        //     order: 'name',
        //     limit: 5,
        //     page: 1
        // };
    };

    return {
        templateUrl: 'directives/fitnessTrend/templates/fitnessTrendTable.html',
        // scope: {
        // zoneId: '@zoneId',
        // xtdZone: '=',
        // xtdDataSelected: "=",
        // previousFrom: '@previousFrom',
        // nextTo: '@nextTo',
        // xtdZoneFirst: '@xtdZoneFirst',
        // xtdZoneLast: '@xtdZoneLast'
        // },
        controller: controllerFunction
            // link: linkFunction
    };
}]);
