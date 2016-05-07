/**
 * Declaring Angular App
 */
var app = angular.module("App", ['ngRoute', 'ngMaterial', 'ngSanitize', 'nvd3', 'md.data.table']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('deep-orange');
});

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider.when(routeMap.commonSettingsRoute, {
        templateUrl: 'views/commonSettings.html',
        controller: 'CommonSettingsController'
    });

    $routeProvider.when(routeMap.healthSettingsRoute, {
        templateUrl: 'views/healthSettings.html',
        controller: 'HealthSettingsController'
    });

    $routeProvider.when(routeMap.zonesSettingsRoute, {
        templateUrl: 'views/zonesSettings.html',
        controller: 'XtdZonesSettingsController'
    });

    $routeProvider.when(routeMap.fitnessRoute, {
        templateUrl: 'views/fitness.html',
        controller: 'FitnessController'
    });

    $routeProvider.when(routeMap.releaseNotesRoute, {
        templateUrl: 'views/releaseNotes.html'
    });

    $routeProvider.when(routeMap.aboutRoute, {
        templateUrl: 'views/about.html'
    });

    $routeProvider.when(routeMap.donateRoute, {
        templateUrl: 'views/donate.html',
        controller: 'DonateController'
    });

    $routeProvider.when(routeMap.shareRoute, {
        templateUrl: 'views/share.html'
    });

    $routeProvider.otherwise({
        redirectTo: routeMap.commonSettingsRoute
    });
}]);
