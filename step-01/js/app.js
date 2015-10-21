'use strict';

(function() {
    angular
        .module('HangmanApp', [
            'ngRoute',
            'ngAnimate',
            'ngMaterial'
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