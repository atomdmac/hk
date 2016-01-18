define([
    'phaser',
    'rot',
    'settings',
    'entity',
    'monster',
    'player',
    'cursor',
    'level',
    'utilities/state-machine'
], function (Phaser, ROT, Settings, Entity, Monster, Player, Cursor, Level, StateMachine) { 
    'use strict';

    // Private vars.
    var game, player, cursor, levels, currentLevelIndex, level;

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(Settings.stage.width, Settings.stage.height, Phaser.AUTO, '', this, false, false);

            game = this.game;


            // Directions that a character can move.
            game.directions = {
                N : new Phaser.Point(0, -1),
                NE: new Phaser.Point(1, -1),
                E : new Phaser.Point(1, 0),
                SE: new Phaser.Point(1, 1),
                S : new Phaser.Point(0, 1),
                SW: new Phaser.Point(-1, 1),
                W : new Phaser.Point(-1, 0),
                NW: new Phaser.Point(-1, -1)
            };
        },

        preload: function() {

            // game.load.spritesheet('walls', 'assets/dawnhack/Objects/Wall.png', 16, 16, 50);
            game.load.spritesheet('undead', 'assets/sprites/dawnhack-undead-1.png', 16, 16, 23);
            game.load.spritesheet('dungeon', 'assets/sprites/dungeon-debug.png', 16, 16, 6);
            game.load.image('player', 'assets/sprites/player-debug.png', 16, 16);
            game.load.image('cursor', 'assets/sprites/cursor-debug.png', 16, 16);

        },
        
        create: function() {
            var self = this;
            // game.scale.setUserScale(2,2);
            // game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

            // Set up physics
            game.physics.startSystem(Phaser.Physics.ARCADE);

            // List of levels.
            levels = [];

            // Set up player.
            game.player = player = new Player(game, 0, 0, 'player');
            game.cursor = cursor = new Cursor(game, 0, 0, 'cursor');

            // User input
            // game.input.keyboard.addKey(Phaser.Keyboard.H).onDown.add(function () {
            //     player.move(game.directions.W);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(function () {
            //     player.move(game.directions.E);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.J).onDown.add(function () {
            //     player.move(game.directions.S);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.B).onDown.add(function () {
            //     player.move(game.directions.SW);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.N).onDown.add(function () {
            //     player.move(game.directions.SE);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.K).onDown.add(function () {
            //     player.move(game.directions.N);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.Y).onDown.add(function () {
            //     player.move(game.directions.NW);
            // });
            // game.input.keyboard.addKey(Phaser.Keyboard.U).onDown.add(function () {
            //     player.move(game.directions.NE);
            // });
            game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function () {

                if (player.tile.x === level.downstairs.tile.x && player.tile.y === level.downstairs.tile.y) {
                    self.goDown();
                }
                else if (player.tile.x === level.upstairs.tile.x && player.tile.y === level.upstairs.tile.y) {
                    self.goUp();
                }
            });

            this.input = new StateMachine();
            this.input.states = {
                'normal': {
                    'onKeyDown': function () {
                        // Don't continue if action is already being taken.
                        if(player.movementTween && player.movementTween.isRunning) { return; }

                        // Interact
                        // else if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                        //     if (player.tile.x === level.downstairs.tile.x && player.tile.y === level.downstairs.tile.y) {
                        //         self.goDown();
                        //     }
                        //     else if (player.tile.x === level.upstairs.tile.x && player.tile.y === level.upstairs.tile.y) {
                        //         self.goUp();
                        //     }
                        // }

                        // Close
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) {
                            self.input.setState('close');
                        }

                        else if (game.input.keyboard.isDown(Phaser.Keyboard.PERIOD)) {
                            if(level.monsters) {
                                level.monsters.forEach(function (monster) {
                                    monster.act();
                                });
                            }
                        }
                    },
                    'update': function () {
                        var nextRound = false;
                        // Don't continue if action is already being taken.
                        if(player.movementTween && player.movementTween.isRunning) { return; }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
                            nextRound = player.move(game.directions.W);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
                            nextRound = player.move(game.directions.E);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
                            nextRound = player.move(game.directions.S);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                            nextRound = player.move(game.directions.SW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
                            nextRound = player.move(game.directions.SE);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                            nextRound = player.move(game.directions.N);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                            nextRound = player.move(game.directions.NW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                            nextRound = player.move(game.directions.NE);
                        }

                        // Advance world state.
                        if(nextRound) {
                            if(level.monsters) {
                                level.monsters.forEach(function (monster) {
                                    monster.act();
                                });
                            }
                        }
                    }

                },
                'close': {
                    'onEnter': function () {
                        cursor.bringToTop();
                        cursor.teleport(player.tile.x, player.tile.y);
                        cursor.exists = true;

                        // Follow the cursor.
                        game.camera.unfollow();
                        game.camera.follow(cursor);
                    },
                    'onExit': function () {
                        cursor.exists = false;
                        game.camera.unfollow();
                        game.camera.follow(player);
                    },
                    'onKeyDown': function () {
                        // Don't continue if action is already being taken.
                        if(cursor.movementTween && cursor.movementTween.isRunning) return;

                        if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
                            cursor.move(game.directions.W);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
                            cursor.move(game.directions.E);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
                            cursor.move(game.directions.S);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                            cursor.move(game.directions.SW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
                            cursor.move(game.directions.SE);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                            cursor.move(game.directions.N);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                            cursor.move(game.directions.NW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                            cursor.move(game.directions.NE);
                        }

                        else if(game.input.keyboard.isDown(Phaser.Keyboard.C) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                            var door = level.containsDoor(cursor.tile.x, cursor.tile.y);
                            if(door) door.close();
                            self.input.setState('normal');
                        }
                    },
                    'update': function () {
                    }
                }
            };
            this.input.setState('normal');
            game.input.keyboard.addCallbacks(this.input, 
                // on Down
                function (code) { self.input.handle('onKeyDown', code); }
                // on Up
                // on Press
            );

            // Load first level.
            this.goDown();
        },

        update: function () {
            this.input.handle('update');
        },

        switchToLevel: function (level) {
            game.world.removeAll(false, true);

            level.revive();

            // Set up player.
            game.add.existing(player);
            
            // Set up player.
            player.bringToTop();
            player.setLevel(level);
            game.camera.follow(player);

            // Set up cursor.
            game.add.existing(cursor);
            cursor.setLevel(level);

            // Debug
            console.log('Dungeon level: ', currentLevelIndex, ' :: ', level);
        },

        goUp: function () {
            if(currentLevelIndex > 0) {
                currentLevelIndex--;
                level = levels[currentLevelIndex];


                this.switchToLevel(level);
                player.teleport(level.downstairs.tile.x, level.downstairs.tile.y);
            }
        },

        goDown: function () {
            if(currentLevelIndex < levels.length - 1) {
                game.world.removeAll(false, true);
                currentLevelIndex++;
                level = levels[currentLevelIndex];
                this.switchToLevel(level);
            } else {
                level = new Level(
                    game, 
                    Settings.map.width, 
                    Settings.map.height, 
                    Settings.map.tile.width, 
                    Settings.map.tile.height
                );
                levels.push(level);
                currentLevelIndex = levels.length - 1;
                this.switchToLevel(level);
            }
            player.teleport(level.upstairs.tile.x, level.upstairs.tile.y);
        }
    };
    
    return Game;
});