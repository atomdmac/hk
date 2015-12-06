define([
    'phaser',
    'rot',
    'entity',
    'monster',
    'player',
    'level',
    'utilities/state-machine'
], function (Phaser, ROT, Entity, Monster, Player, Level, StateMachine) { 
    'use strict';

    // Private vars.
    var game, player, levels, currentLevelIndex, level;

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', this);

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
            game.load.spritesheet('undead', 'assets/sprites/dawnhack-undead-1.png', 16, 16, 36);
            game.load.spritesheet('dungeon', 'assets/sprites/dungeon-debug.png', 16, 16, 6);
            game.load.image('player', 'assets/sprites/player-debug.png', 16, 16);

        },
        
        create: function() {
            var self = this;

            // Set up physics
            game.physics.startSystem(Phaser.Physics.ARCADE);

            // List of levels.
            levels = [];

            // Set up player.
            game.player = player = new Player(game, 0, 0, 'player');
            game.add.existing(player);

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

                if (player.tilePosition.x === level.downstairs.tilePosition.x && player.tilePosition.y === level.downstairs.tilePosition.y) {
                    self.goDown();
                }
                else if (player.tilePosition.x === level.upstairs.tilePosition.x && player.tilePosition.y === level.upstairs.tilePosition.y) {
                    self.goUp();
                }
            });

            game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(function () {
                if(level.monsters) {
                    level.monsters.forEach(function (monster) {
                        monster.act();
                    });
                }
            });

            this.input = new StateMachine();
            this.input.states = {
                'normal': {
                    'update': function () {
                        // Don't continue if action is already being taken.
                        if(player.movementTween && player.movementTween.isRunning) { return; }

                        if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
                            player.move(game.directions.W);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
                            player.move(game.directions.E);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
                            player.move(game.directions.S);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                            player.move(game.directions.SW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
                            player.move(game.directions.SE);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                            player.move(game.directions.N);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                            player.move(game.directions.NW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                            player.move(game.directions.NE);
                        }

                        // Interact
                        // else if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                        //     if (player.tilePosition.x === level.downstairs.tilePosition.x && player.tilePosition.y === level.downstairs.tilePosition.y) {
                        //         self.goDown();
                        //     }
                        //     else if (player.tilePosition.x === level.upstairs.tilePosition.x && player.tilePosition.y === level.upstairs.tilePosition.y) {
                        //         self.goUp();
                        //     }
                        // }

                        // Close
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) {
                            self.input.setState('close');
                        }
                    }
                },
                'close': {
                    'update': function () {
                        console.log('close!');
                        // Don't continue if action is already being taken.
                        if(player.movementTween && player.movementTween.isRunning) return;

                        if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
                            player.move(game.directions.W);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
                            player.move(game.directions.E);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
                            player.move(game.directions.S);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                            player.move(game.directions.SW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
                            player.move(game.directions.SE);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                            player.move(game.directions.N);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                            player.move(game.directions.NW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                            player.move(game.directions.NE);
                        }
                    }
                }
            };
            this.input.setState('normal');

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
            // player = new Player(game, 0, 0, 'player');
            game.add.existing(player);
            
            // Set up player.
            player.bringToTop();
            player.setLevel(level);
            game.camera.follow(player);

            // Debug
            console.log('Dungeon level: ', currentLevelIndex, ' :: ', level);
        },

        goUp: function () {
            if(currentLevelIndex > 0) {
                currentLevelIndex--;
                level = levels[currentLevelIndex];


                this.switchToLevel(level);
                player.teleport(level.downstairs.tilePosition.x, level.downstairs.tilePosition.y);
            }
        },

        goDown: function () {
            if(currentLevelIndex < levels.length - 1) {
                game.world.removeAll(false, true);
                currentLevelIndex++;
                level = levels[currentLevelIndex];
                this.switchToLevel(level);
            } else {
                level = new Level(game, 100, 100, 16, 16);
                levels.push(level);
                currentLevelIndex = levels.length - 1;
                this.switchToLevel(level);
            }
            player.teleport(level.upstairs.tilePosition.x, level.upstairs.tilePosition.y);
        }
    };
    
    return Game;
});