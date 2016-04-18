// TODO To move out in a processor ?!
    /*
computeActivity: function (activity) {

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

},*/
