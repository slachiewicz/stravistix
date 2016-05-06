app.controller("FitnessController", ['$scope', 'ChromeStorageService', 'NotifierService', '$timeout', '$location', function($scope, ChromeStorageService, NotifierService, $timeout, $location) {

    var DAY_LONG_MILLIS = 24 * 3600 * 1000;

    $scope.periodsToWatch = [{
        days: 7,
        label: 'Last 7 days'
    }, {
        days: 30,
        label: 'Last 30 days'
    }, {
        days: 90,
        label: 'Last 90 days'
    }, {
        days: 180,
        label: 'Last 180 days'
    }, {
        days: 365,
        label: 'Last 365 days'
    }, {
        days: 0,
        label: 'All time'
    }];

    $scope.periodSelected = $scope.periodsToWatch[2];

    $scope.periodChanged = function(period) {
        $scope.updateFitnessChartGraph();
    };

    /**
     * @return
     */
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
    $scope.computeRestLooseGain = function(results) {

        // Find the date and loos
        var lastResult = _.clone(_.last(results));

        var dayCountLostCtl = 1;
        var dayCountLostAtl = 1;
        var dayCountInForm = 0;
        var dayCountLostForm = 0;

        lastResult.ctl = parseInt(lastResult.ctl);
        lastResult.atl = parseInt(lastResult.atl);

        var ctlLooseTriggerPercentage = 5;
        var ctlLooseTrigger = ctlLooseTriggerPercentage / 100 * lastResult.ctl;

        var atlLooseTriggerPercentage = 5;
        var atlLooseTrigger = atlLooseTriggerPercentage / 100 * lastResult.atl;

        while (lastResult.ctl > ctlLooseTrigger) {

            lastResult.ctl = lastResult.ctl + (0 - lastResult.ctl) * (1 - Math.exp(-1 / 42));
            lastResult.atl = lastResult.atl + (0 - lastResult.atl) * (1 - Math.exp(-1 / 7));
            lastResult.tsb = lastResult.ctl - lastResult.atl;

            if (lastResult.ctl > ctlLooseTrigger) {
                dayCountLostCtl++;
            }
            if (lastResult.atl > atlLooseTrigger) {
                dayCountLostAtl++;
            }

            if (lastResult.tsb <= 0) {
                dayCountInForm++;
            } else { // Positive
                dayCountLostForm++;
            }
        }

        return {
            lostCtl: {
                percentageTrigger: 100 - ctlLooseTriggerPercentage,
                dayCount: dayCountLostCtl,
                date: new Date((new Date().getTime() + dayCountLostCtl * DAY_LONG_MILLIS))
            },
            lostAtl: {
                percentageTrigger: 100 - atlLooseTriggerPercentage,
                dayCount: dayCountLostAtl,
                date: new Date((new Date().getTime() + dayCountLostAtl * DAY_LONG_MILLIS))
            },
            gainForm: {
                dayCount: dayCountInForm,
                date: new Date((new Date().getTime() + dayCountInForm * DAY_LONG_MILLIS))
            },
            lostForm: {
                dayCount: dayCountLostForm,
                date: new Date((new Date().getTime() + dayCountLostForm * DAY_LONG_MILLIS))
            },
        };
    };

    /**
     * @return
     */
    $scope.prepareTrimpObjectsWithDaysOff = function(activitiesWithHRData) {

        var fromDate = new Date((_.first(activitiesWithHRData)).date);

        var toDate = new Date(); // today

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

        return everyDaysTrimpArray;
    };

    ChromeStorageService.fetchComputedActivities(function(computedActivities) {

        // Filter only activities with HeartRateData to compute trimp
        $scope.activitiesWithHRData = $scope.filterActivitiesWithHRData(computedActivities);

        $scope.trimpObjectsWithDaysOff = $scope.prepareTrimpObjectsWithDaysOff($scope.activitiesWithHRData);

        // Generate table & graph data
        $scope.fitnessData = $scope.computeCtlAtlTsb($scope.trimpObjectsWithDaysOff);

        // Compute rest Loose Gain Data
        $scope.restLooseGainData = $scope.computeRestLooseGain($scope.fitnessData);

        $scope.updateFitnessChartGraph();

        $scope.$apply();

    });


    $scope.updateFitnessChartGraph = function() {
        $scope.fitnessChartData = $scope.generateFitnessChartData($scope.fitnessData);

        $scope.generateGraph();
    };

    $scope.generateGraph = function() {

        $scope.fitnessChartOptions = {
            chart: {
                type: 'lineWithFocusChart',
                height: 750,
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
                // pointRange: [-1,-0.5,0.5,1],
                // padData: true,
                // useInteractiveGuideline: true,
                pointActive: function(d) {
                    var activitiesFound = (_.findWhere($scope.fitnessData, {
                        timestamp: d.x
                    })).activitiesName.length;
                    return activitiesFound;
                },
                // showValues: true,
                // duration: 500,
                /*tooltip: {
                    enabled: true,
                    contentGenerator: function(d) {
                        console.log(d);
                        return 'branch name: ' + d.data.branch;
                    }
                },*/
                /*
                useInteractiveGuideline: true,
                interactiveGuideline: {
                    tooltip: {
                        enabled: true,
                        contentGenerator: function(d) {
                            console.log(d);
                            return '<h3>HELLO WORLD</h3>';
                        }
                    },
                },*/

                // interactive: true,
                    /*
                tooltip: {
                    enabled: true,
                    contentGenerator: function(d) {
                        return '<h3>HELLO WORLD</h3>';
                    }
                },*/
                /*
                interactive: true,
                tooltips: true,
                contentGenerator : function(key, x, y, e, graph) { //return html content
                    console.warn(key);
                    return '<h3>' + key + '</h3>' +
                        '<p>' + y + ' on ' + x + '</p>';
                },*/
                /*
                pointSize: function(d) {
                    return 10;
                },*/

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
                text: 'Chronic Training Load (Fitness), Acute Training Load (Fatigue) & Training Stress Balance (Form)'
            }
        };

    };

    $scope.generateFitnessChartData = function(fitnessData) {

        // Compute from timstamp
        var fromTimestamp;
        if ($scope.periodSelected.days === 0) {
            fromTimestamp = (_.first(fitnessData)).timestamp;
        } else {
            fromTimestamp = new Date().getTime() - $scope.periodSelected.days * DAY_LONG_MILLIS;
        }

        var ctlValues = [];
        var atlValues = [];
        var tsbValues = [];

        _.each(fitnessData, function(fitData) {

            if (fitData.timestamp >= fromTimestamp) {

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
            }

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
                key: "Chronic Training Load",
                values: ctlValues,
                color: '#007fe7'
            }, {
                key: "Acute Training Load",
                values: atlValues,
                color: '#ff53b0'
            }, {
                key: "Training Stress Balance",
                values: tsbValues,
                color: '#ed9c12',
                area: true
            }],
            yDomain: [yDomainMin * 1.05, yDomainMax * 1.05]
        };
    };


}]);
