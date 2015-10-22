'use strict';

(function() {
    angular
        .module('HangmanApp', [
            'ngRoute',
            'ngAnimate',
            'ngMaterial',
            'firebase'
        ])
        .config(function($routeProvider) {
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