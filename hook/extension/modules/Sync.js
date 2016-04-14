function Sync(appResources, userHrrZones, zones) {
    this.appResources = appResources;
    this.userHrrZones = userHrrZones;
    this.zones = zones;
    this.vacuumProcessor = new VacuumProcessor();
    this.untilTimestamp = false;
}

Sync.prototype = {

    fetchActivities: function (untilTimestamp) {
        return this.vacuumProcessor.fetchActivitiesRecursive(untilTimestamp);
    },

    perform: function (untilTimestamp) {

        var self = this;

        var deferred = $.Deferred();

        // Start fetching missing activities
        self.fetchActivities(untilTimestamp).then(function success(activities) {

            // For each activity, fetch his stream and compute extended stats
            _.each(activities, function (activity) {

                self.vacuumProcessor.fetchActivitiesStreamById(activity.id).then(function success(stream) {

                    console.warn(stream);

                }, function error(err) {

                    if (err) {

                        if (err.data.status === 404) {
                            console.warn('Impossible to fetch stream of activity: ' + activity.id);
                        } else {
                            deferred.reject(err);
                        }
                    }
                });
            });

        }, function error(err) {

            deferred.reject(err);

        }, function progress(percentage) {

            deferred.notify({
                fetchActivities: percentage
            });
        });

        return deferred.promise();
    },


    computeActivity: function (activity) {
/*
        // Create worker blob URL if not exist
        if (!self.computeAnalysisWorkerBlobURL) {

            // Create a blob from 'ComputeAnalysisWorker' function variable as a string
            var blob = new Blob(['(', ComputeAnalysisWorker.toString(), ')()'], {
                type: 'application/javascript'
            });

            // Keep track of blob URL to reuse it
            self.computeAnalysisWorkerBlobURL = URL.createObjectURL(blob);
        }

        // Lets create that worker/thread!
        self.computeAnalysisThread = new Worker(self.computeAnalysisWorkerBlobURL);

        // Send user and activity data to the thread
        // He will compute them in the background
        self.computeAnalysisThread.postMessage({
            activityType: activity.type,
            isTrainer: activity.trainer,
            appResources: self.appResources,
            userSettings: {
                userGender: userGender,
                userRestHr: userRestHr,
                userMaxHr: userMaxHr,
                userFTP: userFTP,
                zones: self.zones,
                userHrrZones: self.userHrrZones,
            },
            params: {
                athleteWeight: 73, // TODO Replace
                hasPowerMeter: false, // TODO Replace
                activityStatsMap: activityStatsMap,
                activityStream: activityStream,
                bounds: bounds
            }
        });

        // Listen messages from thread. Thread will send to us the result of computation
        self.computeAnalysisThread.onmessage = function (messageFromThread) {

            callback(messageFromThread.data);

            // Finish and kill thread
            self.computeAnalysisThread.terminate();

        }.bind(this);
        */
    },

};
