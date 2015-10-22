'use strict';

(function() {

    angular
        .module('HangmanApp')
        .controller('MainController', ['$firebaseObject', MainController]);

    function MainController($firebaseObject) {
        var vm = this,
        	ref = new Firebase("https://gdg-cola-web-codelab.firebaseio.com/");

        console.dir(ref);
    }    
})();