app.factory('ChromeStorageService', function($q) {

    var chromeStorageService = {};

    chromeStorageService.fetchUserSettings = function(callback) {
        var deferred = $q.defer();
        chrome.storage.sync.get(userSettings, function(userSettingsSynced) {
            if (callback) callback(userSettingsSynced);
            deferred.resolve(userSettingsSynced);
        });
        return deferred.promise;
    };

    chromeStorageService.updateUserSetting = function(key, value, callback) {
        var deferred = $q.defer();
        var settingToBeUpdated = {};
        settingToBeUpdated[key] = value;
        chrome.storage.sync.set(settingToBeUpdated, function() {
            if (callback) callback();
            deferred.resolve();
        });
        return deferred.promise;
    };

    chromeStorageService.fetchComputedActivities = function(callback) {
        var deferred = $q.defer();
        chrome.storage.local.get({
            computedActivities: null
        }, function(data) {
            if (callback) callback(data.computedActivities);
            deferred.resolve(data.computedActivities);
        });
        return deferred.promise;
    };

    return chromeStorageService;
});
