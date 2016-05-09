/**
 * Declaring Angular App
 */
var app = angular.module("App", ['ngRoute', 'ngMaterial', 'ngSanitize', 'nvd3', 'md.data.table', 'angularMoment']);

app.constant('$colors', {
    strava: '#e94e1b'
});

app.config(function($mdThemingProvider, $colors) {
    var stravaOrange = $mdThemingProvider.extendPalette('orange', {
        '500': $colors.strava,
        'contrastDefaultColor': 'light'
    });
    $mdThemingProvider.definePalette('stravaOrange', stravaOrange);
    $mdThemingProvider.theme('default').primaryPalette('stravaOrange');
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

    $routeProvider.when(routeMap.fitnessTrendRoute, {
        templateUrl: 'views/fitnessTrend.html',
        controller: 'FitnessTrendController'
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
