app.controller("FitnessController", ['$scope', 'ChromeStorageService', 'NotifierService', '$timeout', '$location', function($scope, ChromeStorageService, NotifierService, $timeout, $location) {

    $scope.computedActivities = {};

    $scope.getDayAtMidnight = function(date) {
        date.setHours(Math.abs(date.getTimezoneOffset() / 60));
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };

    ChromeStorageService.fetchComputedActivities(function(computedActivities) {

        $scope.computedActivities = computedActivities;

        $scope.trimpObjectsArray = [];
        _.each(computedActivities, function(activity) {
            if (activity.extendedStats && activity.extendedStats.heartRateData) {
                var date = $scope.getDayAtMidnight(new Date(activity.start_time));
                $scope.trimpObjectsArray.push({
                    date: date,
                    timestamp: date.getTime(),
                    activityName: activity.name,
                    trimp: parseInt(activity.extendedStats.heartRateData.TRIMP.toFixed(0))
                });
            }
        });

        $scope.computeFitness = function(trimpObjectsArray) {

            // Creating clone of trimp object and reverse for chronologic
            trimpObjectsArray = _.clone(trimpObjectsArray);
            trimpObjectsArray.reverse();

            // Inject day off..
            var dayLong = 24 * 3600 * 1000;
            var firstActivityDate = new Date((_.first(trimpObjectsArray)).date);
            var today = new Date();

            var timeDiffBetweenFirstActivityAndToday = Math.abs(today.getTime() - firstActivityDate.getTime());
            var diffDays = Math.ceil(timeDiffBetweenFirstActivityAndToday / dayLong);

            var trimpObjectsWithDaysOffArray = [];

            for (var i = 0; i < diffDays; i++) {

                var currentDayTimestamp = firstActivityDate.getTime() + dayLong * i;

                // Seek if current day with have 1 or serveral trimp. then add...
                var trimpsObjectFoundOnThatDay = _.where(trimpObjectsArray, {
                    timestamp: currentDayTimestamp
                });

                var trimpObjectForWhatEverDay = {
                    date: new Date(currentDayTimestamp),
                    timestamp: currentDayTimestamp,
                    activitiesName: [],
                    trimp: 0
                };

                if (trimpsObjectFoundOnThatDay.length) {

                    // Some trimp have beed found for that day
                    if (trimpsObjectFoundOnThatDay.length > 1) {
                        console.warn('More than 1 activity on ' + trimpsObjectFoundOnThatDay.date + ', handle this on names displayed...');
                    }

                    for (var j = 0; j < trimpsObjectFoundOnThatDay.length; j++) {
                        trimpObjectForWhatEverDay.trimp += trimpsObjectFoundOnThatDay[j].trimp;
                        trimpObjectForWhatEverDay.activitiesName.push(trimpsObjectFoundOnThatDay[j].activityName);
                    }
                }

                trimpObjectsWithDaysOffArray.push(trimpObjectForWhatEverDay);
            }

            // ... End injecting day off..

            // Now compute
            var CTL = 0;
            var ATL = 0;
            var TSB = 0;

            // CTL = CTL(d-1) + [TSS - CTL(d-1)] * [1 - exp^(-1 / 42)]
            // ATL = ATL(d-1) + [TSS - ATL(d-1)] * [1 - exp^(-1 / 7)]
            // TSB = CTL-ATL
            var ctlResults = [];

            _.each(trimpObjectsWithDaysOffArray, function(trimpObject, index, trimpObjectsArray) {

                CTL = CTL + (trimpObject.trimp - CTL) * (1 - Math.exp(-1 / 42));

                var formattedDate = trimpObject.date.toLocaleDateString();

                ctlResults.push({
                    date: formattedDate,
                    timestamp: trimpObject.timestamp,
                    activitiesName: trimpObject.activitiesName,
                    CTL: CTL.toFixed(3)
                });
            });
            return ctlResults;
        };


        $scope.generateFitnessChartData = function(fitnessTableData) {
            var values = [];
            _.each(fitnessTableData, function(fitData) {
                // values.push([fitData.timestamp, fitData.CTL]);
                values.push({
                    x: fitData.timestamp,
                    y: fitData.CTL
                });
            });

            return [{
                key: "CTL",
                values: values
            }];
        };

        $scope.fitnessTableData = $scope.computeFitness($scope.trimpObjectsArray);

        $scope.fitnessChartData = $scope.generateFitnessChartData($scope.fitnessTableData);

        $scope.fitnessChartOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function(d) {
                    return d.x;
                },
                y: function(d) {
                    return d.y;
                },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e) {
                        console.log("stateChange");
                    },
                    changeState: function(e) {
                        console.log("changeState");
                    },
                    tooltipShow: function(e) {
                        console.log("tooltipShow");
                    },
                    tooltipHide: function(e) {
                        console.log("tooltipHide");
                    }
                },
                xAxis: {
                    axisLabel: 'Date',
                    tickFormat: function(d) {
                        return (new Date(d)).toLocaleDateString();
                    },
                },
                yAxis: {
                    axisLabel: 'CTL',
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -10
                },
                callback: function(chart) {
                    console.log("!!! lineChart callback !!!");
                }
            },
            title: {
                enable: true,
                text: 'Fitness, Fatigue and Form'
            }
        };

        $scope.$apply();
        
        /*$scope.data = sinAndCos();

        function sinAndCos() {

            //Line chart data should be sent as an array of series objects.
            var values = [];

            _.each($scope.fitnessData, function(fitData) {
                // values.push([fitData.timestamp, fitData.CTL]);
                values.push({
                    x: fitData.timestamp,
                    y: fitData.CTL
                });
            });

            return [{
                    key: "CTL",
                    values: values
                }
                , {
                                values: cos,
                                key: 'Cosine Wave',
                                color: '#2ca02c'
                            }, {
                                values: sin2,
                                key: 'Another sine wave',
                                color: '#7777ff',
                            }
            ];
        }


*/



    });

    // $scope.xAxisTicksFunction = function() {
    //     console.log(d3.svg.axis().ticks(d3.time.minutes, 5));
    //     return function(d) {
    //         return d3.svg.axis().ticks(d3.time.minutes, 5);
    //     };
    // };

    // $scope.xAxisTickFormatFunction = function() {
    //     return function(d) {
    //         return d3.time.format('%Y/%m/%d')(new Date(d));
    //     };
    // };
    /*
        $scope.xAxisTickFormatFunction = function() {
            return function(d) {
                // return d3.time.format('%x')(new Date(d)); //uncomment for date format
                return (new Date(d)).toLocaleDateString(); //uncomment for date format
            };
        };*/

}]);
