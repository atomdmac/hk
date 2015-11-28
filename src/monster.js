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

        // Stats
        this.name = 'Monster';
        this.health = 100;
        this.maxHealth = this.health;

        // Combat stats.
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

        // Cached references.
        this._map = null;

        // A target to follow.
        this._quary = null;

        // The path to the quary.
        this._quaryPath = null;

        // Signals.
        this.onMove = new Phaser.Signal();
        this.onAttack = new Phaser.Signal();
        this.onDamage = new Phaser.Signal();
        this.onSee = new Phaser.Signal();
        this.onUnsee = new Phaser.Signal();
    }

    Monster.prototype.setMap = function (map) {};
    
    Monster.prototype.canSee = function (x, y) {};
    
    Monster.prototype.updateVision = function () {};

    Monster.prototype.launchAttack = function (victim) {};

    Monster.prototype.takeDamage = function (amount, attacker) {};

    Monster.prototype.kill = function () {};

    Monster.prototype.move = function (direction) {};

    Monster.prototype.follow = function (target) {};

    Monster.prototype.avoid = function (target) {};

    Monster.prototype.travel = function (x, y) {};

    // Used to determine whether another monster is hostile to me or not.
    Monster.prototype.reactTo = function (target) {};

    return Monster;
});