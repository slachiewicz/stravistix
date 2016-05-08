app.factory('FitnessDataService', ['$q', 'ChromeStorageService', function($q, chromeStorageService) {

    var fitnessDataService = {};
    fitnessDataService.static = {};

    /**
     * Statics vars
     */
    fitnessDataService.static.DAY_LONG_MILLIS = 24 * 3600 * 1000;

    /**
     * @return The date at midnight
     */
    fitnessDataService.getDayAtMidnight = function(date) {
        date.setHours(Math.abs(date.getTimezoneOffset() / 60));
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };

    /**
     * @return Computed synced activities
     */
    fitnessDataService.getComputedActivities = function() {

        var deferred = $q.defer();

        // if (!fitnessDataService.computedActivities) {

            console.log('Fetch computedActivities from chromeStorageService');

            chromeStorageService.fetchComputedActivities().then(function successGetFromStorage(computedActivities) {
                fitnessDataService.computedActivities = computedActivities;
                deferred.resolve(computedActivities);
            }, function errorGetFromStorage(err) {
                deferred.reject(err);
            });

        // } else {
        //     console.log('Fetch computedActivities from FitnessDataService local var');
        //     deferred.resolve(fitnessDataService.computedActivities);
        // }

        return deferred.promise;
    };

    /**
     * @return computed activities with HR data only
     */
    fitnessDataService.getCleanedComputedActivitiesWithHeartrateData = function() {

        var deferred = $q.defer();

        // if (!fitnessDataService.computedActivitiesWithHR) {

            console.log('Fetch computedActivitiesWithHR from fitnessDataService.getCleanedComputedActivitiesWithHeartrateData');

            fitnessDataService.getComputedActivities().then(function successGet(computedActivities) {

                var cleanedActivitiesWithHRData = [];
                _.each(computedActivities, function(activity) {
                    if (activity.extendedStats && activity.extendedStats.heartRateData) {
                        var date = fitnessDataService.getDayAtMidnight(new Date(activity.start_time));
                        cleanedActivitiesWithHRData.push({
                            date: date,
                            timestamp: date.getTime(),
                            activityName: activity.name,
                            trimp: parseInt(activity.extendedStats.heartRateData.TRIMP.toFixed(0))
                        });
                    }
                });

                fitnessDataService.computedActivitiesWithHR = cleanedActivitiesWithHRData;
                deferred.resolve(fitnessDataService.computedActivitiesWithHR);

            }, function errorGet(err) {
                deferred.reject(err);
            });

        // } else {
        //     console.log('Fetch computedActivitiesWithHR from FitnessDataService local var');
        //     deferred.resolve(fitnessDataService.computedActivitiesWithHR);
        // }

        return deferred.promise;

    };

    /**
     * @return Fitness object of computed activities including days off (= rest day)
     */
    fitnessDataService.getFitnessObjectsWithDaysOff = function() {

        var deferred = $q.defer();

        // if (!fitnessDataService.fitnessObjectsWithDaysOff) {

            console.log('Fetch fitnessObjectsWithDaysOff from fitnessDataService.getFitnessObjectsWithDaysOff');

            fitnessDataService.getCleanedComputedActivitiesWithHeartrateData().then(function successGet(cleanedActivitiesWithHRData) {

                var fromDate = new Date((_.first(cleanedActivitiesWithHRData)).date);

                var toDate = new Date(); // Today

                // Inject day off..
                var daysDiff = Math.ceil(Math.abs(toDate.getTime() - fromDate.getTime()) / fitnessDataService.static.DAY_LONG_MILLIS);

                var everyDayFitnessObjects = [];

                for (var i = 0; i < daysDiff; i++) {

                    var timestampOfCurrentDay = fromDate.getTime() + fitnessDataService.static.DAY_LONG_MILLIS * i;

                    // Seek if current day with have 1 or serveral trimp. then add...
                    var fitnessObjectFoundOnCurrentDay = _.where(cleanedActivitiesWithHRData, {
                        timestamp: timestampOfCurrentDay
                    });

                    var fitnessObjectOnCurrentDay = {
                        date: new Date(timestampOfCurrentDay),
                        timestamp: timestampOfCurrentDay,
                        activitiesName: [],
                        trimp: 0
                    };

                    if (fitnessObjectFoundOnCurrentDay.length) {

                        // Some trimp have beed found for that day
                        // if (fitnessObjectFoundOnCurrentDay.length > 1) {
                        //     console.warn('More than 1 activity on ' + fitnessObjectFoundOnCurrentDay.date + ', handle this on names displayed...');
                        // }

                        for (var j = 0; j < fitnessObjectFoundOnCurrentDay.length; j++) {
                            fitnessObjectOnCurrentDay.trimp += parseFloat(fitnessObjectFoundOnCurrentDay[j].trimp);
                            fitnessObjectOnCurrentDay.activitiesName.push(fitnessObjectFoundOnCurrentDay[j].activityName);
                        }
                    }

                    everyDayFitnessObjects.push(fitnessObjectOnCurrentDay);
                }

                fitnessDataService.fitnessObjectsWithDaysOff = everyDayFitnessObjects;
                deferred.resolve(fitnessDataService.fitnessObjectsWithDaysOff);

            }, function errorGet(err) {
                deferred.reject(err);
            });

        // } else {
        //     console.log('Fetch fitnessObjectsWithDaysOff from FitnessDataService local var');
        //     deferred.resolve(fitnessDataService.fitnessObjectsWithDaysOff);
        // }

        return deferred.promise;

    };

    /**
     * @return Compute CTl, ATL, TSB results with days off (= rest day)
     */
    fitnessDataService.computeChronicAcuteBalanceTrainingLoad = function(fitnessObjectsWithDaysOff) {
        var ctl = 0;
        var atl = 0;
        var tsb = 0;
        var results = [];
        _.each(fitnessObjectsWithDaysOff, function(trimpObject, index, activitiesWithHRData) {
            ctl = ctl + (trimpObject.trimp - ctl) * (1 - Math.exp(-1 / 42));
            atl = atl + (trimpObject.trimp - atl) * (1 - Math.exp(-1 / 7));
            tsb = ctl - atl;
            results.push({
                date: trimpObject.date.toLocaleDateString(),
                timestamp: trimpObject.timestamp,
                activitiesName: trimpObject.activitiesName,
                ctl: parseFloat(ctl.toFixed(3)),
                atl: parseFloat(atl.toFixed(3)),
                tsb: parseFloat(tsb.toFixed(3)),
            });
        });

        return results;
    };

    /**
     * @return
     */
    fitnessDataService.computeRestLooseGain = function(fitnessData) {

        // Find the date and loos
        var lastResult = _.clone(_.last(fitnessData));

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
                date: new Date((new Date().getTime() + dayCountLostCtl * fitnessDataService.static.DAY_LONG_MILLIS))
            },
            lostAtl: {
                percentageTrigger: 100 - atlLooseTriggerPercentage,
                dayCount: dayCountLostAtl,
                date: new Date((new Date().getTime() + dayCountLostAtl * fitnessDataService.static.DAY_LONG_MILLIS))
            },
            gainForm: {
                dayCount: dayCountInForm,
                date: new Date((new Date().getTime() + dayCountInForm * fitnessDataService.static.DAY_LONG_MILLIS))
            },
            lostForm: {
                dayCount: dayCountLostForm,
                date: new Date((new Date().getTime() + dayCountLostForm * fitnessDataService.static.DAY_LONG_MILLIS))
            },
        };
    };

    /**
     * @return Fitness data objects including CTl, ATL, TSB results with days off (= rest day)
     */
    fitnessDataService.getFitnessData = function() {

        var deferred = $q.defer();

        if (!fitnessDataService.fitnessData) {

            console.log('Fetch fitnessData from fitnessDataService.getFitnessData');

            fitnessDataService.getFitnessObjectsWithDaysOff().then(function successGet(fitnessObjectsWithDaysOff) {

                fitnessDataService.fitnessData = fitnessDataService.computeChronicAcuteBalanceTrainingLoad(fitnessObjectsWithDaysOff);

                deferred.resolve(fitnessDataService.fitnessData);

            }, function errorGet(err) {
                deferred.reject(err);
            });

        } else {
            console.log('Fetch fitnessData from FitnessDataService local var');
            deferred.resolve(fitnessDataService.fitnessData);
        }

        return deferred.promise;

    };

    return fitnessDataService;

}]);
