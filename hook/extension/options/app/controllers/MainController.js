/**
 * Declaring MainController
 */
app.controller('MainController', function($scope, $location, $mdSidenav, $mdToast) {

    // function buildToggler(navID) {
    //     return function() {
    //         $mdSidenav(navID)
    //             .toggle()
    //             .then(function() {
    //                 $log.debug("toggle " + navID + " is done");
    //             });
    //     };
    // }
    //
    // $scope.toggleRight = buildToggler('right');

    $scope.toggleSidenav = function(menu) {
        $mdSidenav(menu).toggle();
    };

    $scope.forward = function(route) {
        console.log('fwd to ' + route);
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

    /*
        Fitness Trend
        Activities Grid
        Targets
        Year progression
        Athlete Settings

        Zones Settings
            Heartrate
            Speed
            Power
            Cadence
            ...
            ...




    */



    $scope.data = {
        title: 'Stravistix',
        user: {
            // name: 'StravistiX',
            // email: 'angular@ninja.com',
            // icon: 'face'
        },

        sidenav: {
            sections: [{
                    name: 'Fitness Trend',
                    icon: 'fitness_center',
                    link: routeMap.fitnessTrendRoute
                }, {
                    name: 'Activities Grid',
                    icon: 'grid_on',
                    link: 'link',
                }, {
                    name: 'Targets',
                    icon: 'adjust',
                    link: 'link'
                }, {
                    name: 'Year progression',
                    icon: 'show_chart',
                    link: 'link'
                }, {
                    name: 'Athlete Settings',
                    icon: 'accessibility',
                    link: 'link'
                }, {
                    name: 'Zone Settings',
                    icon: 'format_line_spacing',
                    expand: true,
                    link: 'link',
                    actions: [{
                        name: 'Heart rate',
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
                    }, {
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
                }


                /*{
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
                               }, {
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
                           }*/
            ]
        },
        toolbar: {
            buttons: [{
                name: 'Button 1',
                icon: 'sync',
                link: 'Button 1'
            }],
            menus: [{
                name: 'Menu 1',
                icon: 'more_vert',
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
});
