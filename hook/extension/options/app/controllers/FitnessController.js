app.controller("FitnessController", ['$scope', '$timeout', '$location', 'FitnessDataService', function($scope, $timeout, $location, fitnessDataService) {

    $scope.query = {
        order: 'name',
        limit: 5,
        page: 1
    };

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

    $scope.periodChanged = function() {
        $scope.updateFitnessChartGraph();
    };

    fitnessDataService.getFitnessData().then(function successGet(fitnessData) {

        $scope.fitnessData = fitnessData;

        $scope.updateFitnessChartGraph();

        $scope.$apply();

    });

    $scope.updateFitnessChartGraph = function() {

        $scope.fitnessChartData = $scope.generateFitnessGraphData($scope.fitnessData);

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

    $scope.generateFitnessGraphData = function(fitnessData) {

        // Compute from timstamp
        var fromTimestamp;
        if ($scope.periodSelected.days === 0) {
            fromTimestamp = (_.first(fitnessData)).timestamp;
        } else {
            fromTimestamp = new Date().getTime() - $scope.periodSelected.days * fitnessDataService.static.DAY_LONG_MILLIS;
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
