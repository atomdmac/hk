define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
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

            game.load.spritesheet('walls', 'assets/dawnhack/Objects/Wall.png', 16, 16, 50);

        },
        
        create: function() {
            var map = new Phaser.Tilemap(game, null, 16, 16, 100, 100);
            var layer = map.createBlankLayer('dungeon', 100, 100, 16, 16);

            // ROT.RNG.setSeed(1234);
            var mapDigger = new ROT.Map.Digger();
            var count = 0;
            mapDigger.create(function (x, y, type) {
                if(type) {
                    console.log(count);
                    var tile = new Phaser.Tile(layer, count, x, y, 16, 16);
                    map.putTile(tile, x, y, layer);
                }
            });

            var drawDoor = function(x, y) {
                // console.log('drawing door!');
                // display.draw(x, y, "", "", "red");
            };

            var rooms = mapDigger.getRooms();
            for (var i=0; i<rooms.length; i++) {
                var room = rooms[i];

                /*console.log('Room ', i, ': ', 
                    room.getLeft(), room.getTop(),
                    room.getRight(), room.getBottom()
                );*/

                room.getDoors(drawDoor);
            }
        }
    };
    
    return Game;
});