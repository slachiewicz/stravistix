function ActivitiesSynchronizer() {
    this.vacuumProcessor = new VacuumProcessor();
    this.untilTimestamp = false;
}

ActivitiesSynchronizer.prototype = {


    /**
     * @return All activities with their stream
     */
    fetch: function (untilTimestamp) {

        var self = this;

        var deferred = Q.defer();

        // Start fetching missing activities
        self.vacuumProcessor.fetchActivitiesRecursive(untilTimestamp).then(function success(activities) {
            var promisesOfActivitiesStreamById = [];
            // For each activity, fetch his stream and compute extended stats
            _.each(activities, function (activity) {
                // Getting promise of stream for each activity...
                promisesOfActivitiesStreamById.push(self.vacuumProcessor.fetchActivityStreamById(activity.id));
            });

            Q.all(promisesOfActivitiesStreamById).then(function success(streamResults) {

                if (streamResults.length !== activities.length) {
                    var errMessage = 'Stream length mismatch with activities fetched length: ' + streamResults.length + ' != ' + activities.length + ')';
                    deferred.reject(errMessage);
                } else {

                    console.log('Stream length match with activities fetched length: (' + streamResults.length + ' == ' + activities.length + ')');

                    _.each(streamResults, function (stream, index) {
                        activities[index].stream = stream;
                    });

                    deferred.resolve(activities);
                }

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
};
