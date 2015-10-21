'use strict';

(function() {

    angular
        .module('HangmanApp')
        .controller('MainController', MainController);

    function MainController() {
        var vm = this;

        console.log('Hello World');
    }    
})();