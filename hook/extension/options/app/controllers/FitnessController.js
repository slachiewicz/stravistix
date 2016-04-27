app.controller("FitnessController", ['$scope', 'ChromeStorageService', 'NotifierService', '$timeout', '$location', function($scope, ChromeStorageService, NotifierService, $timeout, $location) {

    $scope.getDayAtMidnight = function(date) {
        date.setHours(Math.abs(date.getTimezoneOffset() / 60));
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };

    /**
     * @return
     */
    $scope.filterActivitiesWithHRData = function(computedActivities) {
        var activitiesWithHRData = [];
        _.each(computedActivities, function(activity) {
            if (activity.extendedStats && activity.extendedStats.heartRateData) {
                var date = $scope.getDayAtMidnight(new Date(activity.start_time));
                activitiesWithHRData.push({
                    date: date,
                    timestamp: date.getTime(),
                    activityName: activity.name,
                    trimp: parseInt(activity.extendedStats.heartRateData.TRIMP.toFixed(0))
                });
            }
        });
        return activitiesWithHRData;
    };

    /**
     * @return
     */
    $scope.computeCtlAtlTsb = function(everyDaysTrimpArray) {
        // Now compute
        var ctl = 0;
        var atl = 0;
        var tsb = 0;

        var results = [];

        _.each(everyDaysTrimpArray, function(trimpObject, index, activitiesWithHRData) {

            ctl = ctl + (trimpObject.trimp - ctl) * (1 - Math.exp(-1 / 42));
            atl = atl + (trimpObject.trimp - atl) * (1 - Math.exp(-1 / 7));
            tsb = ctl - atl;

            results.push({
                date: trimpObject.date.toLocaleDateString(),
                timestamp: trimpObject.timestamp,
                activitiesName: trimpObject.activitiesName,
                ctl: ctl.toFixed(3),
                atl: atl.toFixed(3),
                tsb: tsb.toFixed(3),
            });

        });

        return results;
    };

    /**
     * @return
     */
    $scope.filterActivitiesAlongUserChoices = function(activitiesWithHRData, fromDate, toDate) {

        var DAY_LONG_MILLIS = 24 * 3600 * 1000;

        if (!fromDate) {
            fromDate = new Date((_.first(activitiesWithHRData)).date);
        }

        if (!toDate) {
            toDate = new Date(); // today
        }

        // Inject day off..
        var daysDiff = Math.ceil(Math.abs(toDate.getTime() - fromDate.getTime()) / DAY_LONG_MILLIS);

        var everyDaysTrimpArray = [];

        for (var i = 0; i < daysDiff; i++) {

            var timestampOfCurrentDay = fromDate.getTime() + DAY_LONG_MILLIS * i;

            // Seek if current day with have 1 or serveral trimp. then add...
            var trimpsObjectFoundOnThatDay = _.where(activitiesWithHRData, {
                timestamp: timestampOfCurrentDay
            });

            var everyDayTrimpData = {
                date: new Date(timestampOfCurrentDay),
                timestamp: timestampOfCurrentDay,
                activitiesName: [],
                trimp: 0
            };

            if (trimpsObjectFoundOnThatDay.length) {

                // Some trimp have beed found for that day
                if (trimpsObjectFoundOnThatDay.length > 1) {
                    console.warn('More than 1 activity on ' + trimpsObjectFoundOnThatDay.date + ', handle this on names displayed...');
                }

                for (var j = 0; j < trimpsObjectFoundOnThatDay.length; j++) {
                    everyDayTrimpData.trimp += parseFloat(trimpsObjectFoundOnThatDay[j].trimp);
                    everyDayTrimpData.activitiesName.push(trimpsObjectFoundOnThatDay[j].activityName);
                }
            }

            everyDaysTrimpArray.push(everyDayTrimpData);
        }

        // console.warn(everyDaysTrimpArray);

        return everyDaysTrimpArray;
        // ... End injecting day off..
        //$scope.computeCtlAtlTsb(trimpObjectForWhatEverDay);
    };

    ChromeStorageService.fetchComputedActivities(function(computedActivities) {

        // Filter only activities with HeartRateData to compute trimp
        $scope.activitiesWithHRData = $scope.filterActivitiesWithHRData(computedActivities);
        $scope.activitiesAlongUserChoices = $scope.filterActivitiesAlongUserChoices($scope.activitiesWithHRData, null, null);

        // Generate table & graph data
        $scope.fitnessTableData = $scope.computeCtlAtlTsb($scope.activitiesAlongUserChoices);
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
                    // axisLabel: 'ctl',
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

        var ctlValues = [];
        var atlValues = [];
        var tsbValues = [];

        _.each(fitnessTableData, function(fitData) {

            ctlValues.push({
                x: fitData.timestamp,
                y: fitData.ctl
            });

            atlValues.push({
                x: fitData.timestamp,
                y: fitData.atl
            });

            tsbValues.push({
                x: fitData.timestamp,
                y: fitData.tsb
            });

        });

        var yDomainMax = d3.max([
            d3.max(ctlValues, function(d) {
                return parseInt(d.y);
            }),
            d3.max(atlValues, function(d) {
                return parseInt(d.y);
            }),
            d3.max(tsbValues, function(d) {
                return parseInt(d.y);
            })
        ], function(d) {
            return d;
        });

        var yDomainMin = d3.min([
            d3.min(ctlValues, function(d) {
                return parseInt(d.y);
            }),
            d3.min(atlValues, function(d) {
                return parseInt(d.y);
            }),
            d3.min(tsbValues, function(d) {
                return parseInt(d.y);
            })
        ], function(d) {
            return d;
        });

        return {
            curves: [{
                key: "ctl",
                values: ctlValues,
                color: '#007fe7'
            }, {
                key: "atl",
                values: atlValues,
                color: '#ff53b0'
            }, {
                key: "tsb",
                values: tsbValues,
                color: '#ed9c12',
                area: true
            }],
            yDomain: [yDomainMin * 1.05, yDomainMax * 1.05]
        };
    };


}]);
