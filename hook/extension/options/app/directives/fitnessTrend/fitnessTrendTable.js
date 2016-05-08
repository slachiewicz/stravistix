app.directive('fitnessTrendTable', ['FitnessDataService', function(fitnessDataService) {

    // var linkFunction = function($scope, element, attrs) {};

    var controllerFunction = function($scope) {

        // Init directives constants
        $scope.const = {};
        $scope.const.fitnessDataForTable = null;

        $scope.unWatchFitnessData = $scope.$watch('fitnessData', function(newValue, oldValue) {

            if (newValue !== oldValue) {

                console.log('$scope.fitnessData just get updated');

                // ... Fitness data just get updated
                var fitnessDataForTable = [];

                _.each(angular.fromJson($scope.fitnessData), function(fitnessObj) {

                    if (fitnessObj.activitiesName.length) {

                        var finalName = '';
                        _.each(fitnessObj.activitiesName, function(name, index) {
                            finalName += name;
                            if (index !== 0) {
                                finalName += ' ; ';
                            }
                        });

                        fitnessObj.activitiesName = finalName;
                        fitnessDataForTable.push(fitnessObj);
                    }
                });

                $scope.const.fitnessDataForTable = fitnessDataForTable;

                console.log('unwatch $scope.fitnessData');
                $scope.unWatchFitnessData();

                $scope.refreshFitnessDataForTable();
            }

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

            if ($scope.filter.form.$dirty) {
                $scope.filter.form.$setPristine();
            }
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
        scope: {
            fitnessData: '@fitnessData'
        },
        controller: controllerFunction
        // link: linkFunction
    };
}]);
