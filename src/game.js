define([
    'phaser',
    'rot',
    'monster',
    'level'
], function (Phaser, ROT, Monster, Level) { 
    'use strict';

    // Private vars.
    var game;

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { 
                preload: this.preload, 
                create: this.create 
            });
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
            game.load.spritesheet('dungeon', 'assets/sprites/dungeon-debug.png', 16, 16, 3);
            game.load.image('player', 'assets/sprites/player-debug.png', 16, 16);

        },
        
        create: function() {
            // Set up level/game world.
            var level = new Level(game, 100, 100, 16);

            // Set up player.
            var playerSpawn = level.getRandomPassable();
            var player = new Monster(game, playerSpawn.x, playerSpawn.y, 'player');
            player.setMap(level.tilemap);
            player.teleport(playerSpawn.x, playerSpawn.y);
            game.add.existing(player);
            game.camera.follow(player);

            // User input
            game.input.keyboard.addKey(Phaser.Keyboard.H).onDown.add(function () {
                player.move(game.directions.W);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(function () {
                player.move(game.directions.E);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.J).onDown.add(function () {
                player.move(game.directions.S);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.B).onDown.add(function () {
                player.move(game.directions.SW);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.N).onDown.add(function () {
                player.move(game.directions.SE);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.K).onDown.add(function () {
                player.move(game.directions.N);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.Y).onDown.add(function () {
                player.move(game.directions.NW);
            });
            game.input.keyboard.addKey(Phaser.Keyboard.U).onDown.add(function () {
                player.move(game.directions.NE);
            });

        }
    };
    
    return Game;
});