define([
    'phaser',
    'rot',
    'monster',
    'utilities/state-machine',
    'progress-bar',
], function (Phaser, ROT, Monster, StateMachine, ProgressBar) { 
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
        this.stats.hitDice = '1d8';
        this.stats.attack = 0;
        this.stats.defense = 0;
        this.stats.speed = 5;

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

        // Health display
        this.healthBar = new ProgressBar(game, 0, -2);
        this.healthBar.setSize(this.width, 2);
        this.healthBar.setMin(0);
        this.healthBar.setMax(this.maxHealth);
        this.healthBar.setProgress(this.health);

        this.addChild(this.healthBar);

        var self = this;
        this.events.onDamage.add(function (target, amount, attacker) {
            self.healthBar.setProgress(target.health);
        });

    }

    Undead.prototype = Object.create(Monster.prototype);
    Undead.prototype.constructor = Undead;

    // Called by the game scheduler.  Should return a "thenable" promise if we
    // need time to animate actions.
    Undead.prototype.act = function () {
        // If I can see the player, chase them immediately!
        if(this.canSee(game.player) && game.player.alive) this._quary = game.player;
        // else, wander randomly.
        else if(Math.random() < 0.25) this._quary = this.level.getRandomPassable();

        this.moveToward(this._quary);

    };

    // Undead.prototype.kill = function () {};

    Undead.prototype.follow = function (target) {};

    Undead.prototype.avoid = function (target) {};

    Undead.prototype.travel = function (x, y) {};

    // Used to determine whether another Undead is hostile to me or not.
    Undead.prototype.reactTo = function (target) {
        // Hostile to all targets except myself.
        return target.tags.undead ?  Monster.reactions.HELPFUL : Monster.reactions.HOSTILE;
    };

    Undead.prototype.setLevel = function (level) {
        Monster.prototype.setLevel.call(this, level);
        // Randomly wandor by default.
        this._quary = this.level.getRandomPassable();
    };


    return Undead;
});