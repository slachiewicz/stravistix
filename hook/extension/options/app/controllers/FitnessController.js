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


        var values = [];
        _.each($scope.fitnessData, function(fitData) {
            values.push([fitData.timestamp, fitData.CTL]);
        });

        $scope.exampleData = [{
            "key": "CTL",
            "bar": true,
            values: values
                // "values" : [ [ 1136005200000 , 1271000.0] , [ 1138683600000 , 1271000.0] , [ 1141102800000 , 1271000.0] , [ 1143781200000 , 0] , [ 1146369600000 , 0] , [ 1149048000000 , 0] , [ 1151640000000 , 0] , [ 1154318400000 , 0] , [ 1156996800000 , 0] , [ 1159588800000 , 3899486.0] , [ 1162270800000 , 3899486.0] , [ 1164862800000 , 3899486.0] , [ 1167541200000 , 3564700.0] , [ 1170219600000 , 3564700.0] , [ 1172638800000 , 3564700.0] , [ 1175313600000 , 2648493.0] , [ 1177905600000 , 2648493.0] , [ 1180584000000 , 2648493.0] , [ 1183176000000 , 2522993.0] , [ 1185854400000 , 2522993.0] , [ 1188532800000 , 2522993.0] , [ 1191124800000 , 2906501.0] , [ 1193803200000 , 2906501.0] , [ 1196398800000 , 2906501.0] , [ 1199077200000 , 2206761.0] , [ 1201755600000 , 2206761.0] , [ 1204261200000 , 2206761.0] , [ 1206936000000 , 2287726.0] , [ 1209528000000 , 2287726.0] , [ 1212206400000 , 2287726.0] , [ 1214798400000 , 2732646.0] , [ 1217476800000 , 2732646.0] , [ 1220155200000 , 2732646.0] , [ 1222747200000 , 2599196.0] , [ 1225425600000 , 2599196.0] , [ 1228021200000 , 2599196.0] , [ 1230699600000 , 1924387.0] , [ 1233378000000 , 1924387.0] , [ 1235797200000 , 1924387.0] , [ 1238472000000 , 1756311.0] , [ 1241064000000 , 1756311.0] , [ 1243742400000 , 1756311.0] , [ 1246334400000 , 1743470.0] , [ 1249012800000 , 1743470.0] , [ 1251691200000 , 1743470.0] , [ 1254283200000 , 1519010.0] , [ 1256961600000 , 1519010.0] , [ 1259557200000 , 1519010.0] , [ 1262235600000 , 1591444.0] , [ 1264914000000 , 1591444.0] , [ 1267333200000 , 1591444.0] , [ 1270008000000 , 1543784.0] , [ 1272600000000 , 1543784.0] , [ 1275278400000 , 1543784.0] , [ 1277870400000 , 1309915.0] , [ 1280548800000 , 1309915.0] , [ 1283227200000 , 1309915.0] , [ 1285819200000 , 1331875.0] , [ 1288497600000 , 1331875.0] , [ 1291093200000 , 1331875.0] , [ 1293771600000 , 1331875.0] , [ 1296450000000 , 1154695.0] , [ 1298869200000 , 1154695.0] , [ 1301544000000 , 1194025.0] , [ 1304136000000 , 1194025.0] , [ 1306814400000 , 1194025.0] , [ 1309406400000 , 1194025.0] , [ 1312084800000 , 1194025.0] , [ 1314763200000 , 1244525.0] , [ 1317355200000 , 475000.0] , [ 1320033600000 , 475000.0] , [ 1322629200000 , 475000.0] , [ 1325307600000 , 690033.0] , [ 1327986000000 , 690033.0] , [ 1330491600000 , 690033.0] , [ 1333166400000 , 514733.0] , [ 1335758400000 , 514733.0]]
        }];

        $scope.$apply();
    });

    $scope.xAxisTicksFunction = function() {
        console.log('xAxisTicksFunction');
        console.log(d3.svg.axis().ticks(d3.time.minutes, 5));
        return function(d) {
            return d3.svg.axis().ticks(d3.time.minutes, 5);
        };
    };

    $scope.xAxisTickFormatFunction = function() {
        return function(d) {
            return d3.time.format('%Y/%m/%d')(new Date(d));
        };
    };

}]);
