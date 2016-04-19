function ActivitiesProcessor(activitiesWithStream, appResources, userSettings) {
    this.activitiesWithStream = activitiesWithStream;
    this.appResources = appResources;
    this.userSettings = userSettings;
}

ActivitiesProcessor.prototype = {

    /**
     * @return Activities array with computed stats
     */
    compute: function () {

        var self = this;

        var deferred = Q.defer();

        // Testing only with one
        var promisesOfActivitiesComputed = [];

        _.each(self.activitiesWithStream, function (activityWithStream) {
            promisesOfActivitiesComputed.push(self.computeActivity(activityWithStream));
        });

        Q.all(promisesOfActivitiesComputed).then(function success(activitiesComputedResults) {

                if (activitiesComputedResults.length !== self.activitiesWithStream.length) {
                    var errMessage = 'activitiesComputedResults length mismatch with activitiesWithStream length: ' + activitiesComputedResults.length + ' != ' + self.activitiesWithStream.length + ')';
                    deferred.reject(errMessage);
                } else {
                    _.each(activitiesComputedResults, function (computedResult, index) {
                        self.activitiesWithStream[index].extendedStats = computedResult;
                        // TODO Remove stream from activityWithStream[index] and/ OR filter with _.pluck wanted fields?!
                    });
                }

                deferred.resolve(self.activitiesWithStream);
            },
            function error(err) {

                console.error(err);
                deferred.reject(err);

            },
            function progress(percentage) {

                console.debug(percentage);

            });

        return deferred.promise;
    },

    createActivityStatMap: function (activityWithStream) {

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

    computeActivity: function (activityWithStream) {

        var self = this;

        var deferred = Q.defer();

        // Create worker blob URL if not exist
        // if (!self.computeAnalysisWorkerBlobURL) {

        // Create a blob from 'ComputeAnalysisWorker' function variable as a string
        var blob = new Blob(['(', ComputeAnalysisWorker.toString(), ')()'], {
            type: 'application/javascript'
        });

        //     // Keep track of blob URL to reuse it
        //     self.computeAnalysisWorkerBlobURL = URL.createObjectURL(blob);
        // }

        // Lets create that worker/thread!
        var computeAnalysisThread = new Worker(URL.createObjectURL(blob));

        // Create activity stats map from given activity
        var activityStatsMap = self.createActivityStatMap(activityWithStream);

        // Send user and activity data to the thread
        // He will compute them in the background
        var threadMessage = {
            activityType: activityWithStream.type,
            isTrainer: activityWithStream.trainer,
            appResources: self.appResources,
            userSettings: {
                userGender: self.userSettings.userGender,
                userRestHr: self.userSettings.userRestHr,
                userMaxHr: self.userSettings.userMaxHr,
                userFTP: self.userSettings.userFTP,
                zones: self.userSettings.zones,
                userHrrZones: self.userSettings.userHrrZones,
            },
            params: {
                athleteWeight: 73, // TODO Replace
                hasPowerMeter: activityWithStream.hasPowerMeter,
                activityStatsMap: activityStatsMap,
                activityStream: activityWithStream.stream,
                bounds: null
            }
        };

        console.error('Wrong params athleteWeight=73');
        console.debug(threadMessage);

        computeAnalysisThread.postMessage(threadMessage);

        // Listen messages from thread. Thread will send to us the result of computation
        computeAnalysisThread.onmessage = function (messageFromThread) {

            deferred.resolve(messageFromThread.data);

            // Finish and kill thread
            computeAnalysisThread.terminate();

        }.bind(this);

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
