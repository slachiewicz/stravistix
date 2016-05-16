app.directive('fitnessTrendGraph', ['FitnessDataService', '$colors', function(fitnessDataService, $colors) {

    var controllerFunction = function($scope) {

        fitnessDataService.getFitnessData().then(function successGet(fitnessData) {

            $scope.fitnessData = fitnessData;

            // Notify parent of data loaded
            $scope.$parent.fitnessTrendGraphDataLoaded();

            // Handle uniques activity types for selection in UI
            $scope.activityTypes = _.uniq(_.flatten(_.pluck($scope.fitnessData, 'type')));

            setTimeout(function() { // Postpone execution at the end
                $scope.updateFitnessChartGraph(true, false);
            });

        });



        $scope.periodsToWatch = [{
            days: moment.duration(moment().diff(moment().subtract(7, 'days'))).asDays(),
            label: 'Last 7 days'
        }, {
            days: moment.duration(moment().diff(moment().subtract(14, 'days'))).asDays(),
            label: 'Last 14 days'
        }, {
            days: moment.duration(moment().diff(moment().subtract(1, 'months'))).asDays(),
            label: 'Last month'
        }, {
            days: moment.duration(moment().diff(moment().subtract(3, 'months'))).asDays(),
            label: 'Last 3 months'
        }, {
            days: moment.duration(moment().diff(moment().subtract(6, 'months'))).asDays(),
            label: 'Last 6 months'
        }, {
            days: moment.duration(moment().diff(moment().subtract(1, 'years'))).asDays(),
            label: 'Last 12 months'
        }, {
            days: moment.duration(moment().diff(moment().subtract(2, 'years'))).asDays(),
            label: 'Last 24 months'
        }, {
            days: 0,
            label: 'From the beginning'
        }];

        $scope.periodSelected = $scope.periodsToWatch[2];

        $scope.lastMonthsPeriodChanged = function() {
            $scope.updateFitnessChartGraph(true, false);
        };

        $scope.fromDateChanged = function() {
            $scope.updateFitnessChartGraph(false, true);
        };

        $scope.toDateChanged = function() {
            $scope.updateFitnessChartGraph(false, true);
        };

        $scope.updateFitnessChartGraph = function(lastMonthPeriodChange, fromOrToDateChange) {

            // Compute from timestamp
            var fromTimestamp, toTimestamp;

            $scope.minDate = moment((_.first($scope.fitnessData)).timestamp).startOf('day').toDate();
            $scope.maxDate = new Date();

            if (lastMonthPeriodChange) {

                if ($scope.periodSelected.days === 0) {
                    fromTimestamp = $scope.minDate.getTime();
                } else {
                    fromTimestamp = moment().startOf('day').subtract($scope.periodSelected.days, 'days').toDate().getTime();
                }

                toTimestamp = $scope.maxDate.getTime();

                // Update datepickers
                $scope.fromDate = new Date(fromTimestamp);
                $scope.toDate = new Date(toTimestamp);
            }

            if (fromOrToDateChange) {
                fromTimestamp = $scope.fromDate.getTime();
                toTimestamp = moment($scope.toDate).endOf('day').toDate();
            }

            $scope.fitnessChartData = $scope.generateFitnessGraphData($scope.fitnessData, fromTimestamp, toTimestamp);

            $scope.generateGraph();
        };

        $scope.generateGraph = function() {

            $scope.fitnessChartOptions = {
                chart: {
                    type: 'lineWithFocusChart',
                    height: '650',
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
                    /*pointActive: function(d) {
                        var activitiesFound = (_.findWhere($scope.fitnessData, {
                            timestamp: d.x
                        })).activitiesName.length;
                        return activitiesFound;
                    },*/
                    // showValues: true,
                    // duration: 500,
                    /*tooltip: {
                        enabled: true,
                        contentGenerator: function(d) {
                            console.log(d);
                            return 'branch name: ' + d.data.branch;
                        }
                    },*/

                    // useInteractiveGuideline: true,
                    // interactiveGuideline: {
                    //     tooltip: {
                    // //         enabled: false,
                    //         contentGenerator: function(d) {
                    //             console.log(d);
                    //             return '<h3>HELLO WORLD</h3>';
                    //         }
                    //     },
                    // },

                    // "tooltip": {
                    //     duration: 0,
                    //     gravity: w,
                    //     distance: 25,
                    //     snapDistance: 0,
                    //     classes: null,
                    //     chartContainer: null,
                    //     enabled: true,
                    //     hideDelay: 0,
                    //     headerEnabled: true,
                    //     fixedTop: null,
                    //     offset: {
                    //         left: 0,
                    //         top: 0
                    //     },
                    //     hidden: false,
                    //     data: null,
                    //     id: nvtooltip-32413
                    // },

                    // interactive: true,

                    tooltip: {
                        // distance: {
                        //     left: 0,
                        //     top: 0
                        // },
                        // snapDistance: 25,
                        enabled: true,
                        // headerEnabled: true,
                        hideDelay: 500,
                        // classes: 'md-padding',
                        contentGenerator: function(d) {

                            var fitnessObject = (_.findWhere($scope.fitnessData, {
                                timestamp: d.value
                            }));

                            console.log(d, fitnessObject);

                            /*
                            <div style="width: 150px; height: 150px;">
                                <div style="color: {{$colors.strava}}; text-align: center;">
                                    ACTIVE
                                </div>
                                <div class="">
                                    Variante apres une bonne choucroute
                                </div>
                                <div class="background: grey;">
                                    Fitness/CTL
                                </div>
                            </div>
                            */

                            var html = '';
                            html += '<div style="padding: 5px;">';
                            // html += '   <span width="auto">Name</span>';
                            html += '   <div><strong>' + ((fitnessObject.activitiesName.length) ? fitnessObject.activitiesName : 'Resting...') + '</strong></div>';
                            html += '   <div>On <strong>' + (new Date(d.point.x)).toLocaleDateString() + '</strong></div>';
                            html += '   <div style="padding: 5px;"></div>';
                            html += '   <div>' + d.series[0].key + ': ' + d.series[0].value + '</div>';
                            html += '   <div>Training Impulse' + ': ' + fitnessObject.trimp + '</div>';
                            html += '</div>';
                            return html;
                        }
                    },
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
                        console.log("callback");
                    },
                }
            };

        };

        $scope.generateFitnessGraphData = function(fitnessData, fromTimestamp, toTimestamp) {

            var ctlValues = [];
            var atlValues = [];
            var tsbValues = [];

            _.each(fitnessData, function(fitData) {

                if (fitData.timestamp >= fromTimestamp && fitData.timestamp <= toTimestamp) {

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
                    key: "Fitness/CTL",
                    values: ctlValues,
                    color: $colors.strava
                }, {
                    key: "Fatigue/ATL",
                    values: atlValues,
                    color: '#525252'
                }, {
                    key: "Form/TSB",
                    values: tsbValues,
                    color: '#cdcdcd',
                    area: true
                }],
                yDomain: [yDomainMin * 1.05, yDomainMax * 1.05]
            };
        };

    };

    return {
        templateUrl: 'directives/fitnessTrend/templates/fitnessTrendGraph.html',
        scope: {},
        controller: controllerFunction
    };
}]);
