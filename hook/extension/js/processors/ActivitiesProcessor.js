function ActivitiesProcessor(appResources, userSettings) {
    this.appResources = appResources;
    this.userSettings = userSettings;
}

ActivitiesProcessor.prototype = {

    outputFields: ["id", "name", "type", "activity_type_display_name", "private", "bike_id", "athlete_gear_id", "start_date", "start_date_local_raw", "start_time", "start_day", "distance", "distance_raw", "long_unit", "short_unit", "moving_time", "moving_time_raw", "elapsed_time", "elapsed_time_raw", "trainer", "static_map", "show_elevation", "has_latlng", "commute", "elevation_gain", "elevation_unit", "elevation_gain_raw", "description", "is_new", "is_changing_type", "suffer_score", "calories", "workout_type", "flagged", "hide_power", "hide_heartrate", "hasPowerMeter", "extendedStats"],

    /**
     * @return Activities array with computed stats
     */
    compute: function(activitiesWithStream) {

        var self = this;
        var deferred = Q.defer();
        var promisesOfActivitiesComputed = [];
        var computedActivitiesPercentageCount = 0;
        var activitiesComputedResults = [];

        var queue = activitiesWithStream.reduce(function(promise, activityWithStream, index) {

            return promise.then(function() {

                return self.computeActivity(activityWithStream).then(function(activityComputedResult) {

                    activitiesComputedResults.push(activityComputedResult);

                    deferred.notify({
                        computedActivitiesPercentage: computedActivitiesPercentageCount / activitiesWithStream.length * 100,
                        index: index,
                        activityId: activityWithStream.id,
                    });

                    computedActivitiesPercentageCount++;

                });

            });

        }, Q.resolve());

        // Queue Finished
        queue.then(function() {

                if (activitiesComputedResults.length !== activitiesWithStream.length) {
                    var errMessage = 'activitiesComputedResults length mismatch with activitiesWithStream length: ' + activitiesComputedResults.length + ' != ' + activitiesWithStream.length + ')';
                    deferred.reject(errMessage);
                } else {

                    _.each(activitiesComputedResults, function(computedResult, index) {
                        activitiesWithStream[index].extendedStats = computedResult;
                        activitiesWithStream[index] = _.pick(activitiesWithStream[index], self.outputFields);
                    });

                    // Sort computedActivities by start date ascending before resolve
                    activitiesWithStream = _.sortBy(activitiesWithStream, function(item) {
                        return (new Date(item.start_time)).getTime();
                    });

                    // Finishing... force progress @ 100% for compute progress callback
                    deferred.notify({
                        computedActivitiesPercentage: 100
                    });

                    deferred.resolve(activitiesWithStream);
                }

            })
            .catch(function(error) {
                console.error(error);
                deferred.reject(error);
            });

        return deferred.promise;
    },

    createActivityStatMap: function(activityWithStream) {
        return {
            'distance': activityWithStream.distance,
            'movingTime': activityWithStream.moving_time_raw,
            'elevation': activityWithStream.elevation_gain,
            'elapsedTime': activityWithStream.elapsed_time_raw,
            // Toughness will not be computed intentionnaly with the following attributes "null":
            'avgPower': null, // Toughness Score will not be computed
            'averageSpeed': null // Toughness Score will not be computed
        };
    },

    computeActivity: function(activityWithStream) {

        var self = this;

        var deferred = Q.defer();

        // Create a blob from 'ComputeAnalysisWorker' function variable as a string
        var blob = new Blob(['(', ComputeAnalysisWorker.toString(), ')()'], {
            type: 'application/javascript'
        });

        // Lets create that worker/thread!
        var computeAnalysisThread = new Worker(URL.createObjectURL(new Blob(['(', ComputeAnalysisWorker.toString(), ')()'], {
            type: 'application/javascript'
        })));

        // Create activity stats map from given activity
        var activityStatsMap = self.createActivityStatMap(activityWithStream);

        // Send user and activity data to the thread
        // He will compute them in the background
        var threadMessage = {
            activityType: activityWithStream.type,
            isTrainer: activityWithStream.trainer,
            appResources: self.appResources,
            userSettings: {
                userGender: self.userSettings.userGender, // Comming from option page
                userRestHr: self.userSettings.userRestHr, // Comming from option page
                userMaxHr: self.userSettings.userMaxHr, // Comming from option page
                userFTP: self.userSettings.userFTP, // Comming from option page
                zones: self.userSettings.zones, // Comming from option page
                userHrrZones: self.userSettings.userHrrZones, // Comming from option page
            },
            params: {
                athleteWeight: self.userSettings.userWeight, // Comming from option page
                hasPowerMeter: activityWithStream.hasPowerMeter,
                activityStatsMap: activityStatsMap,
                activityStream: activityWithStream.stream,
                bounds: null // No segments efforts computed then null...
            }
        };

        computeAnalysisThread.postMessage(threadMessage);

        // Listen messages from thread. Thread will send to us the result of computation
        computeAnalysisThread.onmessage = function(messageFromThread) {

            // Notify upper compute method when an activity has been computed for progress percentage
            deferred.notify(activityWithStream.id);

            // Then resolve...
            deferred.resolve(messageFromThread.data);

            // Finish and kill thread
            computeAnalysisThread.terminate();

        }.bind(this);

        computeAnalysisThread.onerror = function(err) {

            var errorMessage = {
                errObject: err,
                activityId: activityWithStream.id,
            };

            // Push error uppper
            console.error(errorMessage);
            deferred.reject(errorMessage);

            // Finish and kill thread
            computeAnalysisThread.terminate();
        };

        return deferred.promise;
    }
};
