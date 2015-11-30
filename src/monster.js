define([
    'phaser',
    'rot',
    'entity'
], function (Phaser, ROT, Entity) { 
    'use strict';

    // Private vars.
    var game;

    function Monster (_game, x, y, key) {    
        game = _game;

        Entity.call(this, game, x, y, key);

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

        // A target to follow.
        this._quary = null;

        // The path to the quary.
        this._quaryPath = null;

    }

    Monster.prototype = Object.create(Entity.prototype);
    Monster.prototype.constructor = Monster;

    // Called by the game scheduler.  Should return a "thenable" promise if we
    // need time to animate actions.
    Monster.prototype.act = function () {};

    Monster.prototype.kill = function () {};

    Monster.prototype.follow = function (target) {};

    Monster.prototype.avoid = function (target) {};

    Monster.prototype.travel = function (x, y) {};

    // Used to determine whether another monster is hostile to me or not.
    Monster.prototype.reactTo = function (target) {};

    return Monster;
});