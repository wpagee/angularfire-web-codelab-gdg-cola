'use strict';

(function() {

    angular
        .module('HangmanApp')
        .controller('MainController', ['$scope', '$timeout', '$window', '$firebaseArray', 'FireHangman', MainController]);

    function MainController($scope, $timeout, $window, $firebaseArray, FireHangman) {
        var vm = this,
        	baseRef = new Firebase("https://gdg-cola-web-codelab.firebaseio.com/"),
        	messagesRef = baseRef.child('messages'),
            userId = getUserId();

        
        ///////////////////////////////////
        // Initialize the game state     //
        ///////////////////////////////////
        FireHangman.init(baseRef);

        // Set the messages baseRef to our scope variable    
	    vm.messages = $firebaseArray(messagesRef);

        // Watch for when the messages variable is update.
        // When updated scroll tp bottom of message window.
        $scope.$watch('MainController.messages', function(newValue, oldValue) {
            if(newValue.length > 0) {
                var _chatWindow = angular.element(document.getElementById('chat-window'));

                $timeout(function() {
                    _chatWindow[0].scrollTop = _chatWindow[0].scrollHeight;
                }, 50);
            }
        }, true);

        // scope function
	    vm.addMessage = function(evt) {
	    	evt.preventDefault();
	    	var _message = {
	    		name: vm.name,
	    		message: vm.message
	    	};

	    	messagesRef.push(_message);
	    	vm.message = '';
	    }

        // private function
        function getUserId() {
            var _id = null;

            // setup user userId    
            if($window.localStorage.getItem('fireHangman_userId') === null){
                _id = 'user_' + parseInt(Math.random() * 1000, 10) + Date.now();
                $window.localStorage.setItem('fireHangman_userId', _id);
            } else {
                _id = localStorage.getItem('fireHangman_userId');
            }      

            return _id;      
        }

	    
    }    
})();