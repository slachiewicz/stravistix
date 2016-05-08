app.controller("FitnessTrendController", ['$scope', 'FitnessDataService', function($scope, fitnessDataService) {

    $scope.fitnessData = null;

    fitnessDataService.getFitnessData().then(function successGet(fitnessData) {
        $scope.fitnessData = fitnessData;
    });

}]);
