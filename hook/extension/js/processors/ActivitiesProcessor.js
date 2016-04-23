function ActivitiesProcessor(activitiesWithStream, appResources, userSettings) {
    this.activitiesWithStream = activitiesWithStream;
    this.appResources = appResources;
    this.userSettings = userSettings;
}

ActivitiesProcessor.prototype = {

    outputFields: ["id", "name", "type", "activity_type_display_name", "private", "bike_id", "athlete_gear_id", "start_date", "start_date_local_raw", "start_time", "start_day", "distance", "distance_raw", "long_unit", "short_unit", "moving_time", "moving_time_raw", "elapsed_time", "elapsed_time_raw", "trainer", "static_map", "show_elevation", "has_latlng", "commute", "elevation_gain", "elevation_unit", "elevation_gain_raw", "description", "is_new", "is_changing_type", "suffer_score", "calories", "workout_type", "flagged", "hide_power", "hide_heartrate", "hasPowerMeter", "extendedStats"],

    /**
     * @return Activities array with computed stats
     */
    compute: function() {

        var self = this;

        var deferred = Q.defer();

        var promisesOfActivitiesComputed = [];

        var computedActivitiesPercentageCount = 0;

        _.each(self.activitiesWithStream, function(activityWithStream) {
            promisesOfActivitiesComputed.push(self.computeActivity(activityWithStream));
        });

        Q.all(promisesOfActivitiesComputed).then(function success(activitiesComputedResults) {

                if (activitiesComputedResults.length !== self.activitiesWithStream.length) {
                    var errMessage = 'activitiesComputedResults length mismatch with activitiesWithStream length: ' + activitiesComputedResults.length + ' != ' + self.activitiesWithStream.length + ')';
                    deferred.reject(errMessage);
                } else {
                    _.each(activitiesComputedResults, function(computedResult, index) {
                        self.activitiesWithStream[index].extendedStats = computedResult;
                        self.activitiesWithStream[index] = _.pick(self.activitiesWithStream[index], self.outputFields);
                    });
                }

                // Finishing... force progress @ 100% for compute progress callback
                deferred.notify({
                    computedActivitiesPercentage: 100
                });

                deferred.resolve(self.activitiesWithStream);
            },
            function error(err) {

                console.error(err);
                deferred.reject(err);

            },
            function progress(notification) {

                computedActivitiesPercentage = computedActivitiesPercentageCount / self.activitiesWithStream.length * 100;

                // console.warn('ALL promisesOfActivitiesComputed ' + computedActivitiesPercentage);

                deferred.notify({
                    computedActivitiesPercentage: computedActivitiesPercentage,
                    index: notification.index,
                    activityId: notification.value,
                });

                computedActivitiesPercentageCount++;

            });

        return deferred.promise;
    },

    createActivityStatMap: function(activityWithStream) {

        /*
        Sample from activity processor:
        {
            "distance": 122.5,
            "movingTime": 15454,
            "elevation": 505,
            "avgPower": 150,
            "weightedPower": null,
            "energyOutput": 2317,
            "elapsedTime": 17781,
            "averageSpeed": 28.5,
            "averageHeartRate": 155,
            "maxHeartRate": 172
        }
        */

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

            // console.debug('done ' + activityWithStream.id);

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

/*
{
    "id": 549238663,
    "name": "120k with froozen feet & rain ! Strong race with a doe !",
    "emoji_name": "120k with froozen feet & rain ! Strong race with a doe !",
    "type": "Ride",
    "display_type": "Workout",
    "activity_type_display_name": "Ride",
    "private": false,
    "bike_id": 2042105,
    "athlete_gear_id": null,
    "start_date": "Mon, 18/04/2016",
    "start_date_local_raw": 1460980977,
    "start_time": "2016-04-18T10:02:57+0000",
    "start_day": "Mon",
    "distance": "122.5",
    "distance_raw": 122555,
    "long_unit": "kilometers",
    "short_unit": "km",
    "moving_time": "4:17:34",
    "moving_time_raw": 15454,
    "elapsed_time": "4:56:21",
    "elapsed_time_raw": 17781,
    "trainer": false,
    "static_map": true,
    "show_elevation": true,
    "has_latlng": true,
    "commute": false,
    "elevation_gain": "505",
    "elevation_unit": "m",
    "elevation_gain_raw": 505,
    "description": "",
    "activity_url": "https://www.strava.com/activities/549238663",
    "activity_url_for_twitter": "https://www.strava.com/activities/549238663?utm_content=2470979&utm_medium=referral&utm_source=twitter",
    "twitter_msg": "went for a 122.5 kilometer road ride.",
    "is_new": false,
    "is_changing_type": false,
    "suffer_score": null,
    "calories": 2583.5442401399996,
    "feed_data": {
        "entries": []
    },
    "workout_type": 12,
    "flagged": false,
    "hide_power": false,
    "hide_heartrate": false
}

*/
