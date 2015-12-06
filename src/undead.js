define([
    'phaser',
    'rot',
    'monster',
    'utilities/state-machine'
], function (Phaser, ROT, Monster, StateMachine) { 
    'use strict';

    // Private vars.
    var game;

    function Undead (_game, x, y, key) {    
        game = _game;

        Monster.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Undead';
        this.tags.undead = true;
        this.tags.passable = false;
        
        // Stats
        this.health = 100;
        this.maxHealth = this.health;

        // Combat stats.
        this.stats.attack = 10;
        this.stats.defense = 10;
        this.stats.speed = 10;

        // Derived stats.

        // Skills

        // Equipment
        this.equipment.charm = null;
        this.equipment.head = null;
        this.equipment.torso = null;
        this.equipment.leftHand = null;
        this.equipment.rightHand = null;
        this.equipment.feet = null;

        // Inventory

    }

    Undead.prototype = Object.create(Monster.prototype);
    Undead.prototype.constructor = Undead;

    // Called by the game scheduler.  Should return a "thenable" promise if we
    // need time to animate actions.
    Undead.prototype.act = function () {
        // If I can see the player, chase them immediately!
        if(this.canSee(game.player)) this._quary = game.player;
        // Random chance of new direction.
        else if(Math.random() < 0.25) this._quary = this.level.getRandomPassable();

        this.moveToward(this._quary);

    };

    Undead.prototype.kill = function () {};

    Undead.prototype.follow = function (target) {};

    Undead.prototype.avoid = function (target) {};

    Undead.prototype.travel = function (x, y) {};

    // Used to determine whether another Undead is hostile to me or not.
    Undead.prototype.reactTo = function (target) {};

    Undead.prototype.setLevel = function (level) {
        Monster.prototype.setLevel.call(this, level);
        // Randomly wandor by default.
        this._quary = this.level.getRandomPassable();
    };


    return Undead;
});