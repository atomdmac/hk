define([
    'phaser',
    'rot',
    'settings'
], function (Phaser, ROT, Settings) { 
    'use strict';

    // Private vars.
    var game;

    function GameTile (_game, x, y, entity, level) {    
        game = _game;

        // Parent GameTile that this component belongs to.
        this.entity = entity;

        // The map tile that the GameTile is currently on.
        this.tile = null;

        // Cached reference to map (Phaser.TileMap instance)
        this.level = null;

        // Movement tween.
        this.movementTween = null; 

        // Signals.
        this.events.onMove = new Phaser.Signal();
        this.events.onTeleport = new Phaser.Signal();
    }

    GameTile.prototype = Object.create(Phaser.Sprite.prototype);
    GameTile.prototype.constructor = GameTile;

    GameTile.prototype.setLevel = function (level) {
        this.level = level;
    };

    GameTile.prototype.moveToward = function (target) {
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

    GameTile.prototype.move = function (direction, skipAnimation, collideCallback) {
        var newTileX = this.tile.x + direction.x,
            newTileY = this.tile.y + direction.y;

        // If this GameTile is impassable, let's do some collision detection.
        if(!this.passable) {
            // See if door is blocking the way.
            var door = this.level.containsDoor(newTileX, newTileY);
            if(door && !door.isOpen) {
                door.open();
                return true;
            }

            // See if another monster is blocking the way.
            var monster = this.level.containsMonster(newTileX, newTileY);
            if(monster && monster.tags.passable === false) {
                // If they are, do we want to fight them?
                if(this.reactTo(monster) === 0) {
                    if(!monster.defend(this)) {
                        monster.takeDamage(20, this);
                        return true;
                    }
                }
                return false;
            }
            
            // Do not continue if terrain impassable.
            if(!this.level.isPassable(newTileX, newTileY)) return false;
        }

        var oldTileX = this.tile.x,
            oldTileY = this.tile.y,
            oldX = this.x,
            oldY = this.y;
        
        // Update tile reference.
        if(this.tile) this.tile.remove(this);
        this.tile = this.level.getTile(newTileX, newTileY);
        this.tile.add(this);

        if(!skipAnimation) {
            this.movementTween = game.add.tween(this);
            this.movementTween.to({
                x: (this.tile.x * this.level.tileWidth),
                y: (this.tile.y * this.level.tileHeight)
            }, Settings.movePause, null, true);
        } else {
            this.x += (direction.x * this.level.tileWidth);
            this.y += (direction.y * this.level.tileHeight);
        }
        this.events.onMove.dispatch(oldX, oldY, this.x, this.y, oldTileX, oldTileY, this.tile.x, this.tile.y);
        return true;
    };

    GameTile.prototype.teleport = function (x, y) {
        if(this.level && this.level.isPassable(x, y)) {
            if(this.tile) this.tile.remove(this);
            this.tile = this.level.getTile(x, y);
            this.tile.add(this);
            this.x = x * this.level.tileWidth;
            this.y = y * this.level.tileHeight;
            return true;
        }
        return false;
    };

    return GameTile;
});