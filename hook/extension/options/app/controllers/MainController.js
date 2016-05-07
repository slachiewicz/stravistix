/**
 * Declaring MainController
 */
app.controller('MainController', function($scope, $location, $mdSidenav, $mdToast) {

    $scope.toggleSidenav = function(menu) {
        $mdSidenav(menu).toggle();
    };

    $scope.forward = function(action) {
        $scope.data.title = action.name;
        $location.path(action.link);
    };

    $scope.toast = function(message) {
        var toast = $mdToast.simple().content('You clicked ' + message).position('bottom right');
        $mdToast.show(toast);
    };

    $scope.toastList = function(message) {
        var toast = $mdToast.simple().content('You clicked ' + message + ' having selected ' + $scope.selected.length + ' item(s)').position('bottom right');
        $mdToast.show(toast);
    };

    $scope.selected = [];
    $scope.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };

    $scope.data = {
        title: 'Dashboard',
        user: {
            name: 'Angular Ninja',
            email: 'angular@ninja.com',
            icon: 'face'
        },
        toolbar: {
            buttons: [{
                name: 'Button 1',
                icon: 'add',
                link: 'Button 1'
            }],
            menus: [{
                name: 'Menu 1',
                icon: 'message',
                width: '4',
                actions: [{
                    name: 'Action 1',
                    message: 'Action 1',
                    completed: true,
                    error: true
                }, {
                    name: 'Action 2',
                    message: 'Action 2',
                    completed: false,
                    error: false
                }, {
                    name: 'Action 3',
                    message: 'Action 3',
                    completed: true,
                    error: true
                }]
            }]
        },
        sidenav: {
            sections: [{
                name: 'Insights',
                expand: false,
                actions: [{
                    name: 'Fitness Trend',
                    icon: 'fitness_center',
                    link: routeMap.fitnessRoute
                }, {
                    name: 'Activity Grid',
                    icon: 'grid_on',
                    link: 'Action 3'
                }]
            }, {
                name: 'Health settings',
                expand: false,
                icon: 'accessibility',
                actions: [{
                    name: 'Health',
                    icon: 'accessibility',
                    link: 'Action 3'
                }]
            }, {
                name: 'Zones settings md-icon:poll ou equalizer',
                expand: false,
                actions: [{
                    name: 'HR Reserve',
                    icon: 'favorite',
                    link: routeMap.healthSettingsRoute
                }, {
                    name: 'Cycling Speed',
                    icon: 'directions_bike',
                    link: 'Action 2'
                }, {
                    name: 'Runing Pace',
                    icon: 'directions_walk',
                    link: 'Action 2'
                }, {
                    name: 'Cycling Power',
                    icon: 'flash_on',
                    link: 'Action 2'
                },{
                    name: 'Cycling Cadence',
                    icon: 'autorenew',
                    link: 'Action 2'
                }, {
                    name: 'Running Cadence',
                    icon: 'transfer_within_a_station',
                    link: 'Action 2'
                }, {
                    name: 'Grade',
                    icon: 'trending_up',
                    link: 'Action 2'
                }, {
                    name: 'Elevation',
                    icon: 'terrain',
                    link: 'Action 2'
                }, {
                    name: 'Ascent speed',
                    icon: 'call_made',
                    link: 'Action 2'
                }]
            }]
        },
        content: {
            lists: [{
                name: 'List 1',
                menu: {
                    name: 'Menu 1',
                    icon: 'settings',
                    width: '4',
                    actions: [{
                        name: 'Action 1',
                        message: 'Action 1',
                        completed: true,
                        error: true
                    }]
                },
                items: [{
                    name: 'Item 1',
                    description: 'Description 1',
                    link: 'Item 1'
                }, {
                    name: 'Item 2',
                    description: 'Description 2',
                    link: 'Item 2'
                }, {
                    name: 'Item 3',
                    description: 'Description 3',
                    link: 'Item 3'
                }]
            }]
        }
    };
    /*
        // Bootstrap active class name for active menu
        $scope.headerActiveClassName = 'active';

        // Clear healthSettings fields on call
        $scope.resetFields = function() {
            $scope.CommonSettingsActive = null;
            $scope.healthSettingsActive = null;
            $scope.zonesSettingsActive = null;
            $scope.releaseNotesActive = null;
            $scope.aboutActive = null;
            $scope.donateActive = null;
            $scope.shareActive = null;
        };

        // Watch for location changes
        $scope.location = $location;
        $scope.$watch('location.path()', function(path) {

            // Reset header li element classes on watch path change
            $scope.resetFields();

            // Apply proper
            if (path === routeMap.commonSettingsRoute) {

                $scope.CommonSettingsActive = $scope.headerActiveClassName;

            } else if (path === routeMap.healthSettingsRoute) {

                $scope.healthSettingsActive = $scope.headerActiveClassName;

            } else if (path === routeMap.zonesSettingsRoute) {

                $scope.zonesSettingsActive = $scope.headerActiveClassName;

            } else if (path === routeMap.releaseNotesRoute) {

                $scope.releaseNotesActive = $scope.headerActiveClassName;

            } else if (path === routeMap.aboutRoute) {

                $scope.aboutActive = $scope.headerActiveClassName;

            } else if (path === routeMap.donateRoute) {

                $scope.donateActive = $scope.headerActiveClassName;

            } else if (path === routeMap.shareRoute) {

                $scope.shareActive = $scope.headerActiveClassName;
            }
        });*/

});
