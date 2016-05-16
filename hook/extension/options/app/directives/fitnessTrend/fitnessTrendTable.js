app.directive('fitnessTrendTable', ['FitnessDataService', function(fitnessDataService) {

    var controllerFunction = function($scope) {

        // Init directives constants
        $scope.const = {};
        $scope.const.fitnessDataForTable = null;

        fitnessDataService.getFitnessData().then(function successGet(fitnessData) {

            var fitnessDataForTable = [];

            _.each(fitnessData, function(fitnessObj) {

                var newFitnessObj = _.clone(fitnessObj);

                if (newFitnessObj.activitiesName.length) {

                    var finalActivityName = '';
                    _.each(newFitnessObj.activitiesName, function(name, index) {
                        if (index !== 0) {
                            finalActivityName += ' <strong>+</strong> ';
                        }
                        finalActivityName += name;
                    });

                    var finalTypeName = '';
                    _.each(newFitnessObj.type, function(type, index) {
                        if (index > 0) {
                            finalTypeName += ' <strong>+</strong> ';
                        }
                        finalTypeName += type;
                    });

                    newFitnessObj.activitiesName = finalActivityName;
                    newFitnessObj.type = finalTypeName;
                } else {
                    newFitnessObj.activitiesName = '-';
                    newFitnessObj.type = '-';
                    newFitnessObj.trimp = '-';
                }

                fitnessDataForTable.push(newFitnessObj);
            });

            $scope.const.fitnessDataForTable = fitnessDataForTable;

            $scope.refreshFitnessDataForTable();

        });

        $scope.limitOptions = [5, 10, 15, 25, 50, 100];

        $scope.options = {
            rowSelection: false,
            multiSelect: false,
            autoSelect: true,
            decapitate: false,
            largeEditDialog: false,
            boundaryLinks: true,
            limitSelect: true,
            pageSelect: true
        };

        $scope.query = {
            filter: '',
            order: '-timestamp',
            limit: 10,
            page: 1
        };

        $scope.filter = {
            options: {
                debounce: 500
            }
        };

        /**
         * Keep page after searching for activities
         */
        $scope.$watch('query.filter', function(newValue, oldValue) {

            if (!oldValue) {
                $scope.bookmarkPage = $scope.query.page;
            }

            if (newValue !== oldValue) {
                $scope.query.page = 1;
            }

            if (!newValue) {
                $scope.query.page = $scope.bookmarkPage;
            }

            $scope.refreshFitnessDataForTable();
        });

        $scope.removeFilter = function() {
            $scope.filter.show = false;
            $scope.query.filter = '';
        };

        /**
         * Seek for fitness objects
         */
        $scope.refreshFitnessDataForTable = function() {

            var filter = $scope.query.filter;
            filter = filter.replace(' ', '.*');
            filter = filter.trim();

            $scope.fitnessDataForTableFiltered = _.filter($scope.const.fitnessDataForTable, function(item) {
                return item.activitiesName.match(new RegExp(filter, 'ig'));
            });
        };
    };

    return {
        templateUrl: 'directives/fitnessTrend/templates/fitnessTrendTable.html',
        controller: controllerFunction
    };
}]);
