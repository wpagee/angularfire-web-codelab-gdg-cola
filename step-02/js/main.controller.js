'use strict';

(function() {

    angular
        .module('HangmanApp')
        .controller('MainController', ['$scope', '$timeout', '$firebaseArray', MainController]);

    function MainController($scope, $timeout, $firebaseArray) {
        var vm = this,
        	ref = new Firebase("https://gdg-cola-web-codelab.firebaseio.com/"),
        	messagesRef = ref.child('messages');

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
    }    
})();