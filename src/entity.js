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

        // The Entity's position in terms of map tiles.
        this.tilePosition = new Phaser.Point(0, 0);

        // Movement tween.
        this.movementTween = null;

        // Stats
        this.name = 'Entity';
        this.health = 100;
        this.maxHealth = this.health;

        // Cached reference to map (Phaser.TileMap instance)
        this.level = null;

        // Cached reference to other monsters on the level (Phaser.Group instance)
        this._monsters = null;

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
    
    Entity.prototype.canSee = function (x, y) {};
    
    Entity.prototype.updateVision = function () {};

    Entity.prototype.launchAttack = function (victim) {};

    Entity.prototype.takeDamage = function (amount, attacker) {};

    Entity.prototype.move = function (direction, skipAnimation) {
        var newTileX = this.tilePosition.x + direction.x,
            newTileY = this.tilePosition.y + direction.y;
        if(this.level.isPassable(newTileX, newTileY)) {
            
            // Check to see if there are doors in the way.
            var doorBlocks = false;
            this.level.doors.forEach(function (door) {
                if(!door.isOpen && door.tilePosition.x === newTileX && door.tilePosition.y === newTileY) {
                    doorBlocks = true;
                    door.open();
                    return false;
                }
            });
            if(doorBlocks) return false;

            var oldTileX = this.tilePosition.x,
                oldTileY = this.tilePosition.y,
                oldX = this.x,
                oldY = this.y;
            this.tilePosition.x += direction.x;
            this.tilePosition.y += direction.y;
            if(!skipAnimation) {
                this.movementTween = game.add.tween(this);
                this.movementTween.to({
                    x: this.x + (direction.x * this.level.tileWidth),
                    y: this.y + (direction.y * this.level.tileHeight)
                }, 50, null, true);
            } else {
                this.x += (direction.x * this.level.tileWidth);
                this.y += (direction.y * this.level.tileHeight);
            }
            this.events.onMove.dispatch(oldX, oldY, this.x, this.y, oldTileX, oldTileY, this.tilePosition.x, this.tilePosition.y);
            return true;
        }
        return false;
    };

    Entity.prototype.teleport = function (x, y) {
        if(this.level.isPassable(x, y)) {
            this.tilePosition.x = x;
            this.tilePosition.y = y;
            this.x = x * this.level.tileWidth;
            this.y = y * this.level.tileHeight;
            return true;
        }
        return false;
    };

    return Entity;
});