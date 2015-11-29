define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function Monster (game, x, y, key) {    
        Phaser.Sprite.call(this, game, x, y, key);

        // A hash of tiles that the monster can see.
        this._visibleTiles = {};

        // The Monster's position in terms of map tiles.
        this.tilePosition = new Phaser.Point(0, 0);

        // Stats
        this.name = 'Monster';
        this.health = 100;
        this.maxHealth = this.health;

        // Combat stats.
        this.stats = {};
        this.stats.attack = 10;
        this.stats.defense = 10;
        this.stats.speed = 10;

        // Derived stats.

        // Skills

        // Equipment
        this.equipment = {};
        this.equipment.charm = null;
        this.equipment.head = null;
        this.equipment.torso = null;
        this.equipment.leftHand = null;
        this.equipment.rightHand = null;
        this.equipment.feet = null;

        // Inventory
        this.inventory = [];

        // Cached reference to map (Phaser.TileMap instance)
        this.map = null;

        // Cached reference to other monsters on the map (Phaser.Group instance)
        this._monsters = null;

        // A target to follow.
        this._quary = null;

        // The path to the quary.
        this._quaryPath = null;

        // Signals.
        this.events.onMove = new Phaser.Signal();
        this.events.onTeleport = new Phaser.Signal();
        this.events.onAttack = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();
        this.events.onSee = new Phaser.Signal();
        this.events.onUnsee = new Phaser.Signal();
    }

    Monster.prototype = Object.create(Phaser.Sprite.prototype);
    Monster.prototype.constructor = Monster;

    Monster.prototype.setMap = function (map) {
        this.map = map;
    };

    // Called by the game scheduler.  Should return a "thenable" promise if we
    // need time to animate actions.
    Monster.prototype.act = function () {};
    
    Monster.prototype.canSee = function (x, y) {};
    
    Monster.prototype.updateVision = function () {};

    Monster.prototype.launchAttack = function (victim) {};

    Monster.prototype.takeDamage = function (amount, attacker) {};

    Monster.prototype.kill = function () {};

    Monster.prototype.move = function (direction) {
        var candidate = this.map.getTile(this.tilePosition.x + direction.x, this.tilePosition.y + direction.y, 'terrain');
        if(candidate && !candidate.collides) {
            var oldTileX = this.tilePosition.x,
                oldTileY = this.tilePosition.y,
                oldX = this.x,
                oldY = this.y;
            this.tilePosition.x += direction.x;
            this.tilePosition.y += direction.y;
            this.x += (direction.x * this.map.tileWidth);
            this.y += (direction.y * this.map.tileHeight);
            this.events.onMove.dispatch(oldX, oldY, this.x, this.y, oldTileX, oldTileY, this.tilePosition.x, this.tilePosition.y);
            return true;
        }
        return false;
    };

    Monster.prototype.teleport = function (x, y) {
        if(!this.map.getTile(x, y, 'terrain').collides) {
            this.tilePosition.x = x;
            this.tilePosition.y = y;
            this.x = x * this.map.tileWidth;
            this.y = y * this.map.tileHeight;
            return true;
        }
        return false;
    };

    Monster.prototype.follow = function (target) {};

    Monster.prototype.avoid = function (target) {};

    Monster.prototype.travel = function (x, y) {};

    // Used to determine whether another monster is hostile to me or not.
    Monster.prototype.reactTo = function (target) {};

    return Monster;
});