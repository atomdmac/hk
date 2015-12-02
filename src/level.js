define([
    'phaser',
    'rot',
    'entity',
    'door'
], function (Phaser, ROT, Entity, Door) { 
    'use strict';

    // Private vars.
    var game;

    function getRandomInt (min, max) {
        return Math.round((Math.random() * (max - min)) + min);
    }

    function Level (_game, width, height, tileWidth, tileHeight) {

        game = _game;
        var self = this;

        // Set up the special map for physics + visuals.
        this.tilemap = new Phaser.Tilemap(game, null, tileWidth, tileHeight, width, height);
        this.tilemap.addTilesetImage('dungeon', 'dungeon', tileWidth, tileHeight, 0, 0, 0);
        this.terrain = this.tilemap.createBlankLayer('terrain', width, height, tileWidth, tileHeight);

        // Resize the world to our new dungeon.
        this.terrain.resizeWorld();

        // Set up collisions with walls.
        this.tilemap.setCollision([1], true, 'terrain', true);

        // Getters / setters
        this.__defineGetter__('tileWidth', function () { return self.tilemap.tileWidth; });
        this.__defineGetter__('tileHeight', function () { return self.tilemap.tileHeight; });

        // For kicks, let's start with a set seed.
        // ROT.RNG.setSeed(1);

        // Generate terrain.
        var mapDigger = new ROT.Map.Digger();
        mapDigger.create(function (x, y, type) {
            var tile = new Phaser.Tile(self.terrain, type, x, y, tileWidth, tileHeight);
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
        this.doors = game.add.group();
        var makeDoor = function (x, y) {
            /*self.tilemap.removeTile(x, y, self.terrain);
            self.tilemap.putTile(
                new Phaser.Tile(self.terrain, 2, x, y, self.tileWidth, self.tileHeight),
                x, y, self.terrain
            );*/
            var door = new Door(game, x, y);
            door.setLevel(self);
            door.teleport(x, y);
            // Random chance that the door is locked.
            // if(Math.random() < 0.15) door.isLocked = true;
            self.doors.add(door);

        };
        for (var i=0; i<this.rooms.length; i++) {
            this.rooms[i].getDoors(makeDoor);
        }

        // Generate entrance.
        var entrance = this.getRandomPassable();
        this.entrance = new Entity(game, entrance.x, entrance.y, 'dungeon');
        this.entrance.setLevel(this);
        this.entrance.teleport(entrance.x, entrance.y);
        this.entrance.frame = 4;

        // Generate exit
        var exit = this.getRandomPassable();
        this.exit = new Entity(game, exit.x, exit.y, 'dungeon');
        this.exit.setLevel(this);
        this.exit.teleport(exit.x, exit.y);
        this.exit.frame = 5;

        // Generate monsters

    }

    Level.prototype.revive = function () {
        this.terrain.revive();
        this.terrain.game = game;
        game.add.existing(this.terrain);
        this.terrain.resizeWorld();

        game.add.existing(this.exit);
        game.add.existing(this.entrance);

        game.add.existing(this.doors);
    };

    Level.prototype.getRandomPassable = function () {
        var room = new Phaser.ArrayUtils.getRandomItem(this.rooms);
        return this.tilemap.getTile(
            getRandomInt(room.getRight(), room.getLeft()), 
            getRandomInt(room.getBottom(), room.getTop()),
            this.terrain
        );
    };

    Level.prototype.isPassable = function (x, y) {
        var tile = this.tilemap.getTile(x, y);
        return (tile && !tile.collides);
    };

    // TODO: Use specific implemtnation for isTransparent instead of just using isPassable.
    Level.prototype.isTransparent = Level.prototype.isPassable;

    Level.prototype.getVisibleAt = function (x, y, callback) {};

    return Level;
});