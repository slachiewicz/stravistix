function ActivitiesSynchronizer(appResources, userHrrZones, zones) {
    this.appResources = appResources;
    this.userHrrZones = userHrrZones;
    this.zones = zones;
    this.vacuumProcessor = new VacuumProcessor();
    this.untilTimestamp = false;
}

ActivitiesSynchronizer.prototype = {

    /**
     * @return All activities without
     */
    fetchActivities: function (untilTimestamp) {
        return this.vacuumProcessor.fetchActivitiesRecursive(untilTimestamp);
    },

    /**
     * @return All activities with their stream
     */
    fetch: function (untilTimestamp) {

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
};
