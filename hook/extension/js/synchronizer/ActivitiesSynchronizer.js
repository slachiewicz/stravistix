function ActivitiesSynchronizer() {
    this.vacuumProcessor = new VacuumProcessor();
    this.untilTimestamp = false;
}

ActivitiesSynchronizer.prototype = {


    /**
     * @return All activities with their stream
     */
    fetch: function(untilTimestamp) {

        var self = this;

        var deferred = Q.defer();

        // Start fetching missing activities
        self.vacuumProcessor.fetchActivitiesRecursive(untilTimestamp).then(function success(activities) {

            var fetchedActivitiesStreamCount = 0;
            var fetchedActivitiesProgress = 0;

            // var totalActivitiesWithStreamCount = activities.length; // For progress percentage notification... Assuming all activities have stream at first

            var promisesOfActivitiesStreamById = [];
            // For each activity, fetch his stream and compute extended stats
            _.each(activities, function(activity) {
                // Getting promise of stream for each activity...
                promisesOfActivitiesStreamById.push(self.vacuumProcessor.fetchActivityStreamById(activity.id));
            });

            //allSettled
            Q.allSettled(promisesOfActivitiesStreamById).then(function success(streamResults) {

                if (streamResults.length !== activities.length) {
                    var errMessage = 'Stream length mismatch with activities fetched length: ' + streamResults.length + ' != ' + activities.length + ')';
                    deferred.reject(errMessage);
                } else {

                    console.log('Stream length match with activities fetched length: (' + streamResults.length + ' == ' + activities.length + ')');

                    _.each(streamResults, function(data, index) {

                        if (data.state === 'rejected') {
                            // No stream found for this activity
                            console.warn('Stream not found for activity <' + data.reason.activityId + '>, index <' + index + '>', data);

                        } else if (data.state === 'fulfilled') {

                            // Then append stream to activity
                            var hasPowerMeter = true;
                            if (_.isEmpty(data.value.watts)) {
                                data.value.watts = data.value.watts_calc;
                                hasPowerMeter = false;
                            }

                            activities[index].hasPowerMeter = hasPowerMeter;
                            activities[index].stream = data.value;
                        }

                    });

                    // console.log(activities);
                    // console.log(activities.length);

                    // Finishing...
                    // Force progress @ 100% because 'rejected' promises don't call progress callback
                    fetchedActivitiesProgress = 100;

                    deferred.notify({
                        fetchedActivitiesStreamCount: fetchedActivitiesProgress
                    });

                    deferred.resolve(activities);
                }

            }, function error(err) {

                // We don't enter here with allSettled...

                /*
                activities = activities
                console.warn('I should remove ' + err.activityId + ' from activities array');
                deferred.reject(err);
                */
            }, function progress(notification) {

                fetchedActivitiesProgress = fetchedActivitiesStreamCount / activities.length * 100;

                deferred.notify({
                    fetchedActivitiesStreamPercentage: fetchedActivitiesProgress,
                    index: notification.index,
                    activityId: notification.value,
                });

                fetchedActivitiesStreamCount++;
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
