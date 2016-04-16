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

        var deferred = Q.defer();

        // Start fetching missing activities
        self.fetchActivities(untilTimestamp).then(function success(activities) {
            var promisesOfActivitiesStreamById = [];
            // For each activity, fetch his stream and compute extended stats
            _.each(activities, function (activity) {
                // Getting promise of stream for each activity...
                promisesOfActivitiesStreamById.push(self.vacuumProcessor.fetchActivityStreamById(activity.id));
            });

            Q.all(promisesOfActivitiesStreamById).then(function success(results) {
                console.log(results);
            }, function error(err) {
                deferred.reject(err);
            });

        }, function error(err) {

            deferred.reject(err);

        }, function progress(percentage) {

            deferred.notify({
                fetchActivities: percentage
            });
        });

        return deferred.promise;
    },

    // TODO To move out in a processor ?!
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
