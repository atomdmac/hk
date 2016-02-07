define([
    'phaser',
    'rot',
    'dungeon-tile',
    'entity',
    'undead',
    'door'
], function (Phaser, ROT, DungeonTile, Entity, Undead, Door) { 
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


        // GROOOOOOOSSSS!!!
        this.tilemap.putTile = function (tile, x, y, layer) {
        	 if (tile === null){
	            return this.removeTile(x, y, layer);
	        }

	        layer = this.getLayer(layer);

	        if (x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height){
	            var index;

	            if (tile instanceof Phaser.Tile){
	                index = tile.index;

	                if (this.hasTile(x, y, layer)) {
	                    this.layers[layer].data[y][x].copy(tile);
	                }
	                else {
	                    this.layers[layer].data[y][x] = tile;
	                }
	            }
	            else {
	                index = tile;

	                if (this.hasTile(x, y, layer)) {
	                    this.layers[layer].data[y][x].index = index;
	                }
	                else {
	                    this.layers[layer].data[y][x] = new Phaser.Tile(this.layers[layer], index, x, y, this.tileWidth, this.tileHeight);
	                }
	            }

	            if (this.collideIndexes.indexOf(index) > -1) {
	                this.layers[layer].data[y][x].setCollision(true, true, true, true);
	            }
	            else {
	                this.layers[layer].data[y][x].resetCollision();
	            }

	            this.layers[layer].dirty = true;

	            this.calculateFaces(layer);

	            return this.layers[layer].data[y][x];
	        }

	        return null;
        };



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
            var tile = new DungeonTile(self.terrain, type, x, y, tileWidth, tileHeight);
            tile.hide();
            self.tilemap.putTile(tile, x, y, self.terrain);
        });

        // Generate doors.
        this.rooms = mapDigger.getRooms();
        this.doors = game.add.group();
        var makeDoor = function (x, y) {
			// Random chance that door will not be generated.
			if(Math.random() < 0.75) return;

			// .. else make a door.
            var door = new Door(game, x, y);
            door.setLevel(self);
            door.teleport(x, y);

            // Open and close door to reset tilemap collision for LoS.
            door.open();
            // Some doors will remain open.
            if(Math.random() < 0.85) door.close();

            // Random chance that the door is locked.
            // if(Math.random() < 0.15) door.isLocked = true;
            self.doors.add(door);

        };
        for (var i=0; i<this.rooms.length; i++) {
            this.rooms[i].getDoors(makeDoor);
        }

        // Generate upstairs.
        var upstairs = this.getRandomPassable();
        this.upstairs = new Entity(game, upstairs.x, upstairs.y, 'dungeon');
        this.upstairs.setLevel(this);
        this.upstairs.teleport(upstairs.x, upstairs.y);
        this.upstairs.frame = 4;

        // Generate downstairs
        var downstairs = this.getRandomPassable();
        this.downstairs = new Entity(game, downstairs.x, downstairs.y, 'dungeon');
        this.downstairs.setLevel(this);
        this.downstairs.teleport(downstairs.x, downstairs.y);
        this.downstairs.frame = 5;

        // Generate monsters
        this.monsters = game.add.group();
        var curMonster, curSpawn;
        for(var m=0; m<10; m++) {
        	curSpawn = this.getRandomPassable();
        	curMonster = new Undead(game, curSpawn.x, curSpawn.y, 'undead');
        	curMonster.setLevel(this);
        	curMonster.teleport(curSpawn.x, curSpawn.y);
        	// TODO: randomize actual monster types, not just visual appearence.
        	curMonster.frame = 1; // Math.round(Math.random() * 23);
            curMonster.events.onMove.add(this.handleEntityMove, this);
            curMonster.events.onKilled.add(this.handleMonsterDeath, this);



        	this.monsters.addChild(curMonster);
        }
        // Generate other dungeon features

        // Generate items

    }

    Level.prototype.addEntity = function (entity) {
    	if(entity.tag.monster) {
    		this.monsters.add(entity);
    		entity.setLevel(this);
    	}

    	else if(entity.tag.player) {
    		this.player = entity;
    		entity.setLevel(this);
    	}

    	this.addChild(entity);
    };

    Level.prototype.handleEntityMove = function (entity, oldTile, newTile) {
        oldTile.remove(entity);
        newTile.add(entity);
    };

    // Return a serialized version of data representing this map.  Can be used
    // to retore the level later.
    Level.prototype.save = function () {};

    Level.prototype.load = function (json) {};

    Level.prototype.revive = function () {
        this.terrain.revive();
        game.add.existing(this.terrain);
        this.terrain.resizeWorld();

        game.add.existing(this.downstairs);
        game.add.existing(this.upstairs);

        game.add.existing(this.doors);

        game.add.existing(this.monsters);
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
        var tile = this.tilemap.getTile(x, y, this.terrain);
        return (tile && !tile.collides);
    };

    // TODO: Use specific implemtnation for isTransparent instead of just using isPassable.
    Level.prototype.isTransparent = Level.prototype.isPassable;

    Level.prototype.getTile = function (x, y) {
    	return this.tilemap.getTile(x, y, this.terrain);
    };

    Level.prototype.getSurrounding = function (x, y, output) {
    	output = output || {};

    	output.N = this.getTile(x + game.direction.N, y + game.direction.N);
    	output.NE = this.getTile(x + game.direction.NE, y + game.direction.NE);
    	output.E = this.getTile(x + game.direction.E, y + game.direction.E);
    	output.SE = this.getTile(x + game.direction.SE, y + game.direction.SE);
    	output.S = this.getTile(x + game.direction.S, y + game.direction.S);
    	output.SW = this.getTile(x + game.direction.SW, y + game.direction.SW);
    	output.W = this.getTile(x + game.direction.W, y + game.direction.W);
    	output.NW = this.getTile(x + game.direction.NW, y + game.direction.NW);

    	return output;
    };

    Level.prototype.getVisibleAt = function (x, y, callback) {};

    Level.prototype.containsMonster = function (x, y) {
    	// Check monsters
    	for(var m=0; m<this.monsters.length; m++) {
    		if(this.monsters.getAt(m).tile.x === x && this.monsters.getAt(m).tile.y === y) {
    			return this.monsters.getAt(m);
    		}
    	}
    	if(game.player.tile.x == x && game.player.tile.y === y) return game.player;
		return false;
    };

    Level.prototype.containsDoor = function (x, y) {
    	// Check doors
    	for(var door=null, d=0; d<this.doors.length; d++) {
    		door = this.doors.getAt(d);
    		if(door.tile.x === x && door.tile.y === y) {
    			return door;
    		}
    	}
		return false;
    };

    Level.prototype.handleMonsterDeath = function (monster) {
        this.monsters.remove(monster);
    };

    return Level;
});