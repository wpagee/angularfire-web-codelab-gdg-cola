'use strict';

(function() {
    angular
        .module('HangmanApp', [
            'ngRoute',
            'ngAnimate',
            'ngMessages',
            'ngMaterial',
            'firebase'
        ])
        .config(function($routeProvider, $mdThemingProvider) {
            //change your theme color
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('deep-orange');

            $routeProvider
                .when('/', {
                    templateUrl: './views/main.html',
                    controller: 'MainController',
                    controllerAs: 'MainController'
                })
                .otherwise({
                    redirectTo: '/'
                });
        });
})();