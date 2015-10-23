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
              wordsChild,
              gameRunning,
              gameRecords,
              gameRef, 
              wordRecords, 
              selectedWord, 
              selectedHint,
              usedLetters,
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

        var setRandomWord = function() {
            var gameState = null,
                blanks = null,
                keys = Object.keys(wordRecords),
                randomNumber = Math.floor(Math.random() * keys.length);
              
            selectedWord = wordRecords[keys[randomNumber]].word;
            selectedHint = wordRecords[keys[randomNumber]].hint;

            // Get blanks for selected word
            blanks = setBlanksForWord(selectedWord);

            // setup game state
            gameState = {
              word: selectedWord,
              message: selectedHint,
              wordState: blanks,
              usedLetters: '',
              turn: 0,
              left: 7
            };

            gameRef = gameChild.push();
            gameRef.set(gameState);

            botSays("New game started! Word/Phrase <strong>" + blanks + "</strong>");
            botSays("The current hint is:" + selectedHint);

            playersRef.child(0).once('value', function(snapshot) {
              botSays("It's your turn " + snapshot.val() + "! Guess with /guess {{letter}}");
            });
        };

        var setBlanksForWord = function (word) {  
            var output = "";
            for (var i = 0, len = word.length; i < len; i++) {
                if (word[i] === ' ') {
                    output = output + " ";
                } 
                else {
                    output = output + "_";
                }
            }
            return output;
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

            // add game event hook to listen for child items being added
            gameChild.on('child_added', function(snapshot) {
              if(snapshot.val() === null) {
                gameRunning = false;
                console.log('Error: No Game Running in Firebase!');
              } else {
                gameRunning = true;
                gameRef = firebaseRef.child("game").child(snapshot.key());
                gameRecords = snapshot.val();

                selectedWord = gameRecords.word;
                selectedHint = gameRecords.message;
                usedLetters = gameRecords.usedLetters;

              }
            });

            // add game event hook to listen for child items being changed
            gameChild.on('child_changed', function(snapshot) {
              if(snapshot.val() === null) {
                gameRunning = false;
                console.log('Error: No Game Running in Firebase!');
              } else {
                gameRunning = true;
                gameRecords = snapshot.val();

                selectedWord = gameRecords.word;
                selectedHint = gameRecords.message;
                usedLetters = gameRecords.usedLetters;

              }
            });

            wordsChild = firebaseRef.child("words");
            wordsChild.on('value', function(snapshot) {
              if(snapshot.val() === null) {
                console.log('Error: No Words in Firebase!');
              } else {
                wordRecords = snapshot.val();
              }
            });
        };

        service.start = function() {
            if (gameRunning) {
                botSays("Hey, pay attention. We've already started a game.");
                botSays("The current hint is: " + gameRecords.message + "");
            } else {
                setRandomWord();
            }
        };

        service.guess = function() {

        }

        // return public methods as a angualr service
        return service;
    }    
})();