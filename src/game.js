define([
    'phaser',
    'rot',
    'settings',
    'entity',
    'monster',
    'player',
    'cursor',
    'level',
    'fov',
    'progress-bar',
    'death-state',
    'utilities/state-machine'
], function (Phaser, ROT, Settings, Entity, Monster, Player, Cursor, Level, FOV, ProgressBar, DeathState, StateMachine) { 
    'use strict';

    // Private vars.
    var game, scheduler, player, cursor, healthBar, levels, currentLevelIndex, level, fov, keyTimer;

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(Settings.stage.width, Settings.stage.height, Phaser.AUTO, '', this, false, false);

            game = this.game;
            keyTimer = 0;

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
            game.load.spritesheet('undead', 'assets/sprites/dawnhack-undead-1.png', Settings.map.tile.width, Settings.map.tile.height, 32);
            game.load.spritesheet('dungeon', 'assets/sprites/dungeon-debug.png', Settings.map.tile.width, Settings.map.tile.height, 6);
            game.load.image('player', 'assets/sprites/player-debug.png', Settings.map.tile.width, Settings.map.tile.height);
            game.load.image('cursor', 'assets/sprites/cursor-debug.png', Settings.map.tile.width, Settings.map.tile.height);

        },
        
        create: function() {
            var self = this;
            // game.scale.setUserScale(2,2);
            // game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

            // Add states.
            game.state.add('Death', DeathState);

            // Set up physics
            game.physics.startSystem(Phaser.Physics.ARCADE);

            // List of levels.
            levels = [];

            // Set up scheduler for timing.
            game.scheduler = scheduler = new ROT.Scheduler.Speed();

            // Set up player.
            game.player     = player = new Player(game, 0, 0, 'player');

            player.events.onDie.add(function () {
                game.state.start('Death', true, false, {turns: scheduler.getTime()});
            });

            // Set up player Field of View
            game.player.fov = fov    = new FOV(game, player, 5, 

                // Callback for checking whether or not light passes thru a 
                // given cell.
                function (x, y) {
                    if(game.level.isPassable(x, y) || game.level.containsPlayer(x, y)) return true;
                    return false;
                },

                // Callback invoked for each cell that is in the FOV.
                function (x, y, r, visibility) {
                    var tile = self.game.level.getTile(x, y);
                    if(tile) {
                        tile.discovered = true;
                        tile.show();
                    }
                }
            );

            // Update screen when player Field of View is recalculated.
            game.player.fov.events.onUpdate.add(function (fov) {
                game.level.terrain.dirty = true;
            });


            // Set up selection cursor.
            game.cursor = cursor  = new Cursor(game, 0, 0, 'cursor');

            // Set up HUD.
            healthBar = new ProgressBar(game, 0, 0);
            game.add.existing(healthBar);
            game.player.events.onDamage.add(function (target, amount, attacker) {
                healthBar.setMin(0);
                healthBar.setMax(target.maxHealth);
                healthBar.setProgress(target.health);
            });

            healthBar.setMin(0);
            healthBar.setMax(player.maxHealth);
            healthBar.setProgress(player.health);

            // Lock to camera.
            healthBar.fixedToCamera = true;
            healthBar.cameraOffset.x = 20;
            healthBar.cameraOffset.y = 20;

            // Keyboard Controls
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
                        if(keyTimer > game.time.now) { return; }

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
                        if(keyTimer > game.time.now) { return; }

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
                        // Close
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.C)) {
                            keyTimer = game.time.now + Settings.turnPause;
                            self.input.setState('close');
                        }
                        // Wait
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.PERIOD)) {
                            keyTimer = game.time.now + Settings.turnPause;
                            nextRound = true;
                        }

                        // Advance world state.
                        if(nextRound) {
                            keyTimer = game.time.now + Settings.turnPause;
                            fov.update(player.tile.x, player.tile.y, 10);
                            if(level.monsters) {
                                for(var i=0; i<game.level.monsters.length; i++) {
                                    var m = game.scheduler.next();
                                    if(m === player) return;
                                    else m.act();
                                    
                                }
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
                        game.camera.follow(cursor, Phaser.Camera.FOLLOW_TOPDOWN);
                    },
                    'onExit': function () {
                        cursor.exists = false;
                        game.camera.unfollow();
                        game.camera.follow(player);
                    },
                    'onKeyDown': function () {
                    },
                    'update': function () {
                        var nextRound = false;
                        // Don't continue if action is already being taken.
                        if(keyTimer > game.time.now) { return; }

                        if (game.input.keyboard.isDown(Phaser.Keyboard.H)) {
                            nextRound = cursor.move(game.directions.W);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
                            nextRound = cursor.move(game.directions.E);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
                            nextRound = cursor.move(game.directions.S);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
                            nextRound = cursor.move(game.directions.SW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
                            nextRound = cursor.move(game.directions.SE);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
                            nextRound = cursor.move(game.directions.N);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
                            nextRound = cursor.move(game.directions.NW);
                        }
                        else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
                            nextRound = cursor.move(game.directions.NE);
                        }

                        else if(game.input.keyboard.isDown(Phaser.Keyboard.C) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                            var door = level.containsDoor(cursor.tile.x, cursor.tile.y);

                            // If there is a door under the cursor, close it and
                            // recalculate the player's FOV.
                            if(door) {
                                door.close();
                                player.fov.update();
                            }

                            // Exit 'close door' mode.
                            self.input.setState('normal');

                            nextRound = true;
                        }

                        if(nextRound) keyTimer = game.time.now + Settings.turnPause;
                    }
                }
            };
            this.input.setState('normal');

            // Listen for user input.
            var inputChokeTimer = game.time.now;
            game.input.keyboard.addCallbacks(this.input, 
                // on Down
                function (code) { 
                    if(inputChokeTimer < game.time.now) {
                        inputChokeTimer = game.time.now + Settings.movePause;
                        self.input.handle('onKeyDown', code); 
                    }
                }
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

            game.level = level;

            // Set up scheduler.
            game.scheduler.clear();
            game.scheduler.add(player, true);
            level.monsters.forEachAlive(function (monster) {
                game.scheduler.add(monster, true);
            });

            // Set up player.
            game.add.existing(player);
            
            // Set up player.
            player.bringToTop();
            player.setLevel(level);
            game.camera.follow(player);

            // Set up cursor.
            game.add.existing(cursor);
            cursor.setLevel(level);

            // Re-adjust HUD.
            game.add.existing(healthBar);
            healthBar.bringToTop();

            // Debug
            console.log('Dungeon level: ', currentLevelIndex, ' :: ', level);
        },

        goUp: function () {
            if(currentLevelIndex > 0) {
                currentLevelIndex--;
                level = levels[currentLevelIndex];


                this.switchToLevel(level);
                player.teleport(level.downstairs.tile.x, level.downstairs.tile.y);
                player.fov.update();

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
            player.fov.update();
        }
    };
    
    return Game;
});