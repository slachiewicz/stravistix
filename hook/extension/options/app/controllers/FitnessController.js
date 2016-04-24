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

        console.log(computedActivities.length);
        console.log(computedActivities);

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
            // trimpObjectsArray = _.clone(trimpObjectsArray);
            // trimpObjectsArray.reverse();

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

            var results = [];

            _.each(trimpObjectsWithDaysOffArray, function(trimpObject, index, trimpObjectsArray) {

                CTL = CTL + (trimpObject.trimp - CTL) * (1 - Math.exp(-1 / 42));
                ATL = ATL + (trimpObject.trimp - ATL) * (1 - Math.exp(-1 / 7));
                TSB = CTL - ATL;

                var formattedDate = trimpObject.date.toLocaleDateString();

                results.push({
                    date: formattedDate,
                    timestamp: trimpObject.timestamp,
                    activitiesName: trimpObject.activitiesName,
                    CTL: CTL.toFixed(3),
                    ATL: ATL.toFixed(3),
                    TSB: TSB.toFixed(3),
                });
            });
            return results;
        };

        $scope.fitnessTableData = $scope.computeFitness($scope.trimpObjectsArray);

        $scope.fitnessChartData = $scope.generateFitnessChartData($scope.fitnessTableData);

        $scope.generateGraph();

        $scope.$apply();
    });

    $scope.generateGraph = function() {

        $scope.fitnessChartOptions = {
            chart: {
                type: 'lineWithFocusChart',
                height: 800,
                // height2: 500,
                // clipEdge: true,
                // rescaleY: true,
                // clipVoronoi: false,
                // "duration": 500,
                margin: {
                    top: 20,
                    right: 50,
                    bottom: 80,
                    left: 50
                },
                yDomain: $scope.fitnessChartData.yDomain,
                // y2Domain: $scope.fitnessChartData.yDomain,
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
                    // axisLabel: 'Date',
                    ticks: 12,
                    tickFormat: function(d) {
                        return (new Date(d)).toLocaleDateString();
                    },
                    staggerLabels: true
                },
                yAxis: {
                    ticks: 10,
                    // axisLabel: 'CTL',
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -10,
                },
                y2Axis: {
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    },
                    // scale: 0.5,
                    // outerTickSize:100,
                    // range: [-500, 500],
                },
                x2Axis: {
                    ticks: 10,
                    tickFormat: function(d) {
                        return null; //(new Date(d)).toLocaleDateString();
                    },
                    // tickSize:[100, 100],
                    tickPadding: 15,
                    // padding: {
                    //     top: 20,
                    //     right: 50,
                    //     bottom: 80,
                    //     left: 50
                    // },
                    // staggerLabels: true,
                    // axisLabelDistance: -10,
                    // height: 150
                },
                callback: function(chart) {
                    console.log("!!! lineChart callback !!!");
                },
            },
            title: {
                enable: true,
                text: 'Fitness, Fatigue and Form'
            }
        };

    };

    $scope.generateFitnessChartData = function(fitnessTableData) {

        var CTLValues = [];
        var ATLValues = [];
        var TSBValues = [];

        _.each(fitnessTableData, function(fitData) {

            CTLValues.push({
                x: fitData.timestamp,
                y: fitData.CTL
            });

            ATLValues.push({
                x: fitData.timestamp,
                y: fitData.ATL
            });

            TSBValues.push({
                x: fitData.timestamp,
                y: fitData.TSB
            });

        });

        var yDomainMax = d3.max([
            d3.max(CTLValues, function(d) {
                return parseInt(d.y);
            }),
            d3.max(ATLValues, function(d) {
                return parseInt(d.y);
            }),
            d3.max(TSBValues, function(d) {
                return parseInt(d.y);
            })
        ], function(d) {
            return d;
        });

        var yDomainMin = d3.min([
            d3.min(CTLValues, function(d) {
                return parseInt(d.y);
            }),
            d3.min(ATLValues, function(d) {
                return parseInt(d.y);
            }),
            d3.min(TSBValues, function(d) {
                return parseInt(d.y);
            })
        ], function(d) {
            return d;
        });

        return {
            curves: [{
                key: "ATL",
                values: ATLValues,
                color: '#ff53b0'
            }, {
                key: "CTL",
                values: CTLValues,
                color: '#007fe7'
            }, {
                key: "TSB",
                values: TSBValues,
                color: '#ed9c12',
                area: true
            }],
            yDomain: [yDomainMin * 1.05, yDomainMax * 1.05]
        };
    };


}]);
