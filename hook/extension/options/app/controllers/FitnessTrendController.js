app.controller("FitnessTrendController", ['$scope', 'FitnessDataService', function($scope, fitnessDataService) {

    $scope.loadFitnessTrendTable = false;

    $scope.fitnessTrendGraphDataLoaded = function() {
        $scope.loadFitnessTrendTable = true;
    };

}]);
