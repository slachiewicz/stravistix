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
                ATL = ATL + (trimpObject.trimp - ATL) * (1 - Math.exp(-1 / 7));
                TSB = CTL - ATL;

                var formattedDate = trimpObject.date.toLocaleDateString();

                ctlResults.push({
                    date: formattedDate,
                    timestamp: trimpObject.timestamp,
                    activitiesName: trimpObject.activitiesName,
                    CTL: CTL.toFixed(3),
                    ATL: ATL.toFixed(3),
                    TSB: TSB.toFixed(3),
                });
            });
            return ctlResults;
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
            // console.log(yDomainMax);
            // console.log(yDomainMin);
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
                    color: '#ed9c12'
                }],
                yDomain: [yDomainMin, yDomainMax]
            };
        };

        $scope.fitnessTableData = $scope.computeFitness($scope.trimpObjectsArray);

        $scope.fitnessChartData = $scope.generateFitnessChartData($scope.fitnessTableData);

        $scope.fitnessChartOptions = {
            chart: {
                type: 'lineWithFocusChart',
                height: 800,
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
                    ticks: 10,
                    axisLabel: 'CTL',
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -10
                },
                y2Axis: {
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    }
                },
                x2Axis: {
                    tickFormat: function(d) {
                        return (new Date(d)).toLocaleDateString();
                    },
                    axisLabelDistance: -10
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

        $scope.$apply();

        /*

        "yAxis": {
      "axisLabel": "Y Axis",
      "axisLabelDistance": 0,
      "dispatch": {},
      "staggerLabels": false,
      "rotateLabels": 0,
      "rotateYLabel": true,
      "showMaxMin": true,
      "height": 60,
      "ticks": null,
      "width": 75,
      "margin": {
        "top": 0,
        "right": 0,
        "bottom": 0,
        "left": 0
      },
      "duration": 250,
      "orient": "left",
      "tickValues": null,
      "tickSubdivide": 0,
      "tickSize": 6,
      "tickPadding": 3,
      "domain": [
        0,
        1
      ],
      "range": [
        0,
        1
      ]
    },

    */

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
