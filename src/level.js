define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function Level (_game, width, height, cellSize) {

        game = _game;

        // Set up the special map for physics + visuals.
        this.tilemap = new Phaser.Tilemap(game, null, cellSize, cellSize, width, height);
        this.terrain = map.createBlankLayer('terrain', width, height, cellSize, cellSize);

        // For kicks, let's start with a set seed.
        ROT.RNG.setSeed(1234);

        // Generate terrain.
        var mapDigger = new ROT.Map.Digger();
        var count = 0;
        mapDigger.create(function (x, y, type) {
            if(type) {
                var tile = new Phaser.Tile(layer, count, x, y, cellSize, cellSize);
                map.putTile(tile, x, y, layer);
            }
        });

        // Generate doors.
        var rooms = mapDigger.getRooms(),
            room;
        for (var i=0; i<rooms.length; i++) {
            room = rooms[i];
            room.getDoors(this.makeDoor);
        }

        // Generate player entry

        // Generate exits

        // Generate monsters


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

    Level.prototype.addDoor = function (x, y) {
        this.terrain.putTile(new Phaser.Tile(this.terrain, 0, x, y, this.cellSize));
    };

    return Level;
});