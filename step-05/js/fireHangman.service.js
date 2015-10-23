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

        /////////////////////
        // PRIVATE METHODS //
        /////////////////////
        var botSays = function(msg) {
            var payload = {
                name: 'FIREBOT',
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

            botSays("New game started! Word/Phrase " + blanks);
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

        var replaceAt = function(string, index, character) {
            return string.substr(0, index) + character + string.substr(index+character.length);
        }

        var updateBlanksForWord = function(letter) {
            var index = 0,
                wordState = gameRecords.wordState;

            index = selectedWord.indexOf(letter);
            while (index >= 0) {
                wordState = replaceAt(wordState, index, letter);
                index = selectedWord.indexOf(letter, index + 1);
            }

            return wordState;
        };

        var reset = function(){
            gameRef.remove();
            gameRunning = false;
        };

        ////////////////////
        // PUBLIC METHODS //
        ////////////////////
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

                if (gameRecords.word === gameRecords.wordState || gameRecords.left === 0) {
                    gameRef.remove();
                    gameRunning = false;
                }
              }
            });

            // Our game words
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
                botSays("The current hint is: " + gameRecords.message);
            } else {
                setRandomWord();
            }
        };

        service.guess = function(letter) {
            if (gameRecords.turn === playerId) {
                // run our letter check
                // we'll need to update the wordState
                var updateWord = updateBlanksForWord(letter);

                // Subtract a turn, use only if guess misses
                var turnsLeft = gameRecords.left - 1;

                // Add letter guess to usedLetters
                usedLetters = usedLetters + letter;
                        
                if (selectedWord.indexOf(letter) !== -1) {
                    // we have a match!
                    botSays("We have a hit captain!");

                    if (gameRecords.word === updateWord) {
                      botSays("Winner winner firebase dinner! You did it " + userId + "! Answer:" + selectedWord);
                    } else {
                      botSays("Turns left: " + gameRecords.left);
                      botSays("Word state: " + updateWord);
                    }

                    gameRef.update({
                      usedLetters: usedLetters,
                      wordState: updateWord,
                      turn: playerId,
                      left: gameRecords.left
                    });
                } else {
                    // we have a miss!
                    botSays("We have missed, the meter grows towards game over.");

                    if (turnsLeft === 0) {
                        botSays("It's game over mannnnn! Answer was: " + selectedWord);

                        gameRef.update({
                            left: 0
                        });
                    } else {
                        botSays("Turns left: " + turnsLeft);
                        botSays("Word state: " + gameRecords.wordState);

                        // Increment the turn
                        playersRef.child(playerId+1).once('value', function(snapshot) {
                            var nextTurn = 0;

                            if (snapshot.val() !== null) {
                              nextTurn = playerId+1;
                            }

                            gameRef.update({
                              usedLetters: usedLetters,
                              wordState: updateWord,
                              turn: nextTurn,
                              left: turnsLeft
                            });

                            playersRef.child(nextTurn).once('value', function(snapshot) {
                              if (snapshot.val() !== null) {
                                botSays("It's your turn " + snapshot.val() + "! Guess with /guess {{letter}}");
                              }
                            });
                        });
                    }
                }

            } else {
                botSays("Whooaaa there " + userId + ", it's not your turn. Slow your roll.");
            }
        }

        // return public methods as a angualr service
        return service;
    }    
})();