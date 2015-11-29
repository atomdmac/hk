define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function getRandomInt (min, max) {
        return Math.round((Math.random() * (max - min)) + min);
    }

    function Level (_game, width, height, cellSize) {

        game = _game;
        var self = this;

        // Set up the special map for physics + visuals.
        this.cellSize = cellSize;
        this.tilemap = new Phaser.Tilemap(game, null, cellSize, cellSize, width, height);
        this.tilemap.addTilesetImage('dungeon', 'dungeon', cellSize, cellSize, 0, 0, 0);
        this.terrain = this.tilemap.createBlankLayer('terrain', width, height, cellSize, cellSize);

        // Resize the world to our new dungeon.
        this.terrain.resizeWorld();

        // Set up collisions with walls.
        this.tilemap.setCollision([1], true, 'terrain', true);

        // For kicks, let's start with a set seed.
        // ROT.RNG.setSeed(1);

        // Generate terrain.
        var mapDigger = new ROT.Map.Digger();
        mapDigger.create(function (x, y, type) {
            var tile = new Phaser.Tile(self.terrain, type, x, y, cellSize, cellSize);
            if(type === 0) {
                tile.setCollision(false, false, false, false);
            }
            else if(type === 1) {
                tile.setCollision(true, true, true, true);
            }

            self.tilemap.putTile(tile, x, y, self.terrain);
        });

        // Generate doors.
        this.rooms = mapDigger.getRooms();
        var makeDoor = function (x, y) {
            self.tilemap.removeTile(x, y, self.terrain);
            self.tilemap.putTile(
                    new Phaser.Tile(self.terrain, 2, x, y, self.cellSize, self.cellSize),
                    x, y, self.terrain
                );
        };
        for (var i=0; i<this.rooms.length; i++) {
            this.rooms[i].getDoors(makeDoor);
        }

        // Generate exits

        // Generate monsters

    }

    Level.prototype.getRandomPassable = function () {
        var room = new Phaser.ArrayUtils.getRandomItem(this.rooms);
        return this.tilemap.getTile(
            getRandomInt(room.getRight(), room.getLeft()), 
            getRandomInt(room.getBottom(), room.getTop()),
            this.terrain
        );
    };

    Level.prototype.isPassable = function (x, y) {
        this.tilemap.getTile(x, y);
    };

    Level.prototype.isTransparent = function (x, y) {};

    Level.prototype.getVisibleAt = function (x, y, callback) {};

    return Level;
});