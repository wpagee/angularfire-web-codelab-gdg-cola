'use strict';

(function() {

    angular
        .module('HangmanApp')
        .service('FireHangman', ['$window', FireHangman]);

    function FireHangman($window) {
        var service = {};

        // private variables
        var firebaseRef,
            messagesRef,
            gameChild,       
            gameRef,
            playersRef,
            playerList,
            playerId,
            userId;

        // private methods
        var botSays = function(msg) {
            var payload = {
                name: '** FIREBOT **',
                message: msg
            };
            messagesRef.push(payload);
        };
        
        // public methods
        service.init = function(context) {
            // Our endpoint
            firebaseRef = context;

            // Setup some references
            messagesRef = firebaseRef.child("messages");
            playersRef = firebaseRef.child("players");
            gameChild = firebaseRef.child("game");

            userId = $window.localStorage.getItem('fireHangman_userId');

            // Define out players
            playersRef.transaction(function(playerList) {
                if (playerList === null) {
                  playerList = [];
                }

                for (var i = 0; i < playerList.length; i++) {
                  if (playerList[i] === userId) {
                    playerId = i;
                    return;
                  }
                }

                playerList[i] = userId;
                playerId = i;
                return playerList;
            }, function (error, committed) {       
              // Nothing Yet...who knows...maybe we'll use this later...maybe...
            });
        };

        service.start = function() {

        };

        service.guess = function() {

        }

        // return public methods as a angualr service
        return service;
    }    
})();