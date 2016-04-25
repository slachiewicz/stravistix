/**
 * Declaring MainController
 */
app.controller('MainController', function($scope, $location, $mdSidenav, $mdToast) {

    $scope.toggleSidenav = function(menu) {
        $mdSidenav(menu).toggle();
    };

    $scope.forward = function(route) {
        $location.path(route);
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
                    name: 'Fitness',
                    icon: 'fitness_center',
                    link: 'Action 3'
                }, {
                    name: 'Grid',
                    icon: 'grid_on',
                    link: 'Action 3'
                }]
            }, {
                name: 'Settings',
                expand: false,
                actions: [{
                    name: 'Health settings',
                    icon: 'settings',
                    link: 'Action 1'
                }, {
                    name: 'Zone settings',
                    icon: 'settings',
                    link: 'Action 2'
                }, {
                    name: 'Release note',
                    icon: 'note',
                    link: routeMap.releaseNotesRoute
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
