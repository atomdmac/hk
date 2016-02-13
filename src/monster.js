define([
    'phaser',
    'rot',
    'entity',
    'combat-floater',
    'utilities/dice'
], function (Phaser, ROT, Entity, CombatFloater, Dice) { 
    'use strict';

    // Private vars.
    var game;

    function Monster (_game, x, y, key) {    
        game = _game;

        Entity.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Monster';
        this.tags.monster = true;
        this.tags.passable = false;
        
        // Stats
        this.health = 100;
        this.maxHealth = this.health;

        // Combat stats.
        this.stats = {};
        this.stats.level   = 1;
        this.stats.hitDie  = '1d6';
        this.stats.attack  = 10;
        this.stats.defense = 10;
        this.stats.speed   = 10;

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

    Monster.reactions = {
        HOSTILE: 0,
        UNCOOPERATIVE: 1,
        NEUTRAL: 2,
        FRIENDLY: 3,
        HELPFUL: 4
    };

    // Called by the game scheduler.  Should return a "thenable" promise if we
    // need time to animate actions.
    Monster.prototype.act = function () {};

    // Monster.prototype.kill = function () {};

    Monster.prototype.follow = function (target) {};

    Monster.prototype.avoid = function (target) {};

    Monster.prototype.travel = function (x, y) {};

    /*
     * Given an ability score, use the d20 method for determining an ability modifier.
     */
    Monster.prototype.getBaseAbilityMod = function (score) {
        return Math.floor(score / 2) - 5;
    };

    Monster.prototype.rollToHitMelee = function () {
        return this.getBaseAbilityMod(this.stats.attack) + Dice.roll('1d20');
    };

    Monster.prototype.rollForDamage = function () {
        return Dice.roll(this.stats.hitDie);
    };

    Monster.prototype.defend = function (targetNumber) {
        return this.getBaseAbilityMod(this.stats.defense) + Dice.roll('1d20') > targetNumber;
    };

    Monster.prototype.takeDamage = function (amount, attacker) {
        this.combatFloater.hit(amount);
        Entity.prototype.takeDamage.call(this, amount, attacker);
    };


    // Used to determine whether another monster is hostile to me or not.
    Monster.prototype.reactTo = function (target) {
        // Default is hostile
        return Monster.reactions.HOSTILE;
    };

    return Monster;
});