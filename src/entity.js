define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function Entity (_game, x, y, key) {    
        game = _game;

        Phaser.Sprite.call(this, game, x, y, key);

        // A hash of tiles that the monster can see.
        this._visibleTiles = {};

        // The tile that the entity is currently on.
        this.tile = null;

        // Movement tween.
        this.movementTween = null;

        // Identifying information
        this.name = 'Entity';
        // A list of 'types' or words describing this entity.  Example: 'monster', 'door';
        this.tags = {
            passable: true
        }; 
        
        // Stats
        this.health = 100;
        this.maxHealth = this.health;

        // Cached reference to map (Phaser.TileMap instance)
        this.level = null;

        // Cached reference to other monsters on the level (Phaser.Group instance)
        this._monsters = null;

        // A Line instance representing the LoS between me and something I'm 
        // trying to see.
        this._losLine = new Phaser.Line();

        // Signals.
        this.events.onMove = new Phaser.Signal();
        this.events.onTeleport = new Phaser.Signal();
        this.events.onAttack = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();
        this.events.onSee = new Phaser.Signal();
        this.events.onUnsee = new Phaser.Signal();
    }

    Entity.prototype = Object.create(Phaser.Sprite.prototype);
    Entity.prototype.constructor = Entity;

    Entity.prototype.setLevel = function (level) {
        this.level = level;
    };
    
    Entity.prototype.canSee = function (target) {
        if(!this.level) return false;
        var los = this._losLine;
        if(arguments.length > 1) {
            los.start.x = this.x;
            los.start.y = this.y;
            los.end.x = arguments[0];
            los.end.y = arguments[1];
        } else {
            los.start.x = this.x;
            los.start.y = this.y;
            los.end.x = target.x;
            los.end.y = target.y;
        }

        //  Use target centers.
        los.start.x += this.level.tileWidth / 2;
        los.start.y += this.level.tileHeight / 2;
        los.end.x += this.level.tileWidth / 2;
        los.end.y += this.level.tileHeight / 2;

        var path = this.level.terrain.getRayCastTiles(los, 4, true);
        if(path.length) return false;
        return true;
    };

    Entity.prototype.moveToward = function (target) {
        var targetPos = new Phaser.Point(),
            slope = new Phaser.Point(),
            targetDir = new Phaser.Point();
        // Given coords instead of target object.
        if(arguments.length > 1) {
            targetPos.x = arguments[0];
            targetPos.y = arguments[1];
        } else {
            // Attempt to use tile property if available.
            targetPos.x = target.tile ? target.tile.x : target.x;
            targetPos.y = target.tile ? target.tile.y : target.y;
        }

        // Calculate slope.
        Phaser.Point.subtract(targetPos, this.tile, slope);
        Phaser.Point.normalize(slope, slope);

        targetDir.x = Math.round(slope.x);
        targetDir.y = Math.round(slope.y);

        var hasMoved;

        // Attempt to move to next position.
        hasMoved = this.move(targetDir);

        // If we couldn't move to our ideal spot, let's find the next best thing.
        // Let's try moving horizontally first.
        if(!hasMoved && slope.x) {
            targetDir.x = Phaser.Math.sign(slope.x);
            targetDir.y = 0;
            hasMoved = this.move(targetDir);
        }

        // Failing that, let's try vertically.
        if(!hasMoved && slope.y) {
            targetDir.x = 0;
            targetDir.y = Phaser.Math.sign(slope.y);
            hasMoved = this.move(targetDir);
        }

        // What about diagonally?
        if(!hasMoved && !slope.x) {
            targetDir.x = 1;
            targetDir.y = Phaser.Math.sign(slope.y);
            hasMoved = this.move(targetDir);
        }
        if(!hasMoved && !slope.x) {
            targetDir.x = -1;
            targetDir.y = Phaser.Math.sign(slope.y);
            hasMoved = this.move(targetDir);
        }
        if(!hasMoved && !slope.y) {
            targetDir.x = Phaser.Math.sign(slope.x);
            targetDir.y = 1;
            hasMoved = this.move(targetDir);
        }
        if(!hasMoved && !slope.y) {
            targetDir.x = Phaser.Math.sign(slope.x);
            targetDir.y = -1;
            hasMoved = this.move(targetDir);
        }
    };
    
    Entity.prototype.updateVision = function () {};

    Entity.prototype.launchAttack = function (victim) {};

    Entity.prototype.takeDamage = function (amount, attacker) {};

    Entity.prototype.move = function (direction, skipAnimation) {
        var newTileX = this.tile.x + direction.x,
            newTileY = this.tile.y + direction.y;

        // See if door is blocking the way.
        var door = this.level.containsDoor(newTileX, newTileY);
        if(door && !door.isOpen) {
            door.open();
            return true;
        }

        // See if another monster is blocking the way.
        var monster = this.level.containsMonster(newTileX, newTileY);
        if(monster && monster.tags.passable === false) return false;
        
        // Do not continue if terrain impassable.
        if(!this.level.isPassable(newTileX, newTileY)) return false;

        var oldTileX = this.tile.x,
            oldTileY = this.tile.y,
            oldX = this.x,
            oldY = this.y;
        
        // Update tile reference.
        this.tile = this.level.getTile(newTileX, newTileY);

        if(!skipAnimation) {
            this.movementTween = game.add.tween(this);
            this.movementTween.to({
                x: (this.tile.x * this.level.tileWidth),
                y: (this.tile.y * this.level.tileHeight)
            }, 150, null, true);
        } else {
            this.x += (direction.x * this.level.tileWidth);
            this.y += (direction.y * this.level.tileHeight);
        }
        this.events.onMove.dispatch(oldX, oldY, this.x, this.y, oldTileX, oldTileY, this.tile.x, this.tile.y);
        return true;
    };

    Entity.prototype.teleport = function (x, y) {
        if(this.level && this.level.isPassable(x, y)) {
            this.tile = this.level.getTile(x, y);
            this.x = x * this.level.tileWidth;
            this.y = y * this.level.tileHeight;
            return true;
        }
        return false;
    };

    return Entity;
});