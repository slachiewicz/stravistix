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
            var lastActivityDate = new Date();

            var timeDiff = Math.abs(lastActivityDate.getTime() - firstActivityDate.getTime());
            var diffDays = Math.ceil(timeDiff / dayLong);
            /*
                        console.log(firstActivityDate);
                        console.log(lastActivityDate);
                        console.log(timeDiff);
                        console.log(diffDays);*/

            var trimpObjectsWithDaysOffArray = [];

            for (var i = 0; i < diffDays; i++) {

                var currentDayTimestamp = firstActivityDate.getTime() + dayLong * i;

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
                // Seek if current day with have 1 or serveral trimp. then add...
            }


            // CTL = CTL(d-1) + [TSS - CTL(d-1)] * [1 - exp^(-1 / 42)]
            // ATL = ATL(d-1) + [TSS - ATL(d-1)] * [1 - exp^(-1 / 7)]
            // TSB = CTL-ATL

            // Now compute
            var CTL = 0;
            var ATL = 0;
            var TSB = 0;

            var ctlResults = [];

            $scope.csvResult = 'Date, CTL\n';

            _.each(trimpObjectsWithDaysOffArray, function(trimpObject, index, trimpObjectsArray) {

                CTL = CTL + (trimpObject.trimp - CTL) * (1 - Math.exp(-1 / 42));

                var formattedDate = trimpObject.date.getDate() + '/' + (trimpObject.date.getMonth() + 1) + '/' + trimpObject.date.getFullYear();

                ctlResults.push({
                    date: formattedDate,
                    timestamp: trimpObject.timestamp,
                    activitiesName: trimpObject.activitiesName,
                    CTL: CTL.toFixed(2)
                });

                $scope.csvResult += formattedDate + ',' + CTL.toFixed(2) + '\n';
            });

            return ctlResults;
        };

        $scope.fitnessData = $scope.computeFitness($scope.trimpObjectsArray);
        /*
                // Test draw graph... NVD3
                $scope.options = {
                    chart: {
                        type: 'lineWithFocusChart',
                        height: 450,
                        margin: {
                            top: 20,
                            right: 20,
                            bottom: 60,
                            left: 40
                        },
                        duration: 50,
                        xAxis: {
                            axisLabel: 'TIME',
                            tickFormat: function(d) {
                                return d3.format(',f')(d);
                            }
                        },
                        x2Axis: {
                            tickFormat: function(d) {
                                return d3.format(',f')(d);
                            }
                        },
                        yAxis: {
                            axisLabel: 'CTL',
                            tickFormat: function(d) {
                                return d3.format(',.2f')(d);
                            },
                            rotateYLabel: false
                        },
                        y2Axis: {
                            tickFormat: function(d) {
                                return d3.format(',.2f')(d);
                            }
                        }

                    }
                };

                $scope.data = generateData();

                function generateData() {
                    return stream_layers(3, 10 + Math.random() * 200, .1).map(function(data, i) {
                        return {
                            key: 'Stream' + i,
                            values: data
                        };
                    });
                }

                function stream_layers(n, m, o) {
                    if (arguments.length < 3) o = 0;

                    function bump(a) {
                        var x = 1 / (.1 + Math.random()),
                            y = 2 * Math.random() - .5,
                            z = 10 / (.1 + Math.random());
                        for (var i = 0; i < m; i++) {
                            var w = (i / m - y) * z;
                            a[i] += x * Math.exp(-w * w);
                        }
                    }
                    return d3.range(n).map(function() {
                        var a = [],
                            i;
                        for (i = 0; i < m; i++) a[i] = o + o * Math.random();
                        for (i = 0; i < 5; i++) bump(a);
                        return a.map(stream_index);
                    });
                }

                function stream_waves(n, m) {
                    return d3.range(n).map(function(i) {
                        return d3.range(m).map(function(j) {
                            var x = 20 * j / m - i / 3;
                            return 2 * x * Math.exp(-.5 * x);
                        }).map(stream_index);
                    });
                }

                function stream_index(d, i) {
                    return {
                        x: i,
                        y: Math.max(0, d)
                    };
                }*/

        $scope.$apply();
    });


}]);
