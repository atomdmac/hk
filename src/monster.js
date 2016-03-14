define([
    'phaser',
    'rot',
    'settings',
    'entity',
    'combat-floater',
    'utilities/dice'
], function (Phaser, ROT, Settings, Entity, CombatFloater, Dice) { 
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

        // Abilities
        this.abilities = {};
        this.abilities.strength     = 10;
        this.abilities.dexterity    = 10;
        this.abilities.constitution = 10;
        this.abilities.intelligence = 10;
        this.abilities.wisdom       = 10;
        this.abilities.charisma     = 10;
        this.abilities.speed        = 10;

        // Combat stats.
        this.stats = {};
        this.stats.level   = 1;
        this.stats.hitDie  = '1d6';
        this.stats.baseDamage = '1d3';
        this.stats.baseAttackBonus = 0;

        // Derived stats.
        this.calculateStats();

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

        // Events
        this.events.onEquip = new Phaser.Signal();
        this.events.onUnequip = new Phaser.Signal();

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
    Monster.prototype.act = function () {
        if(this.tile && !game.player.fov.contains(this.tile.x, this.tile.y)) {
            return;
        }
        return {
            then: function(cb) { setTimeout(cb, Settings.turnPause); }
        };
    };

    // Monster.prototype.kill = function () {};

    Monster.prototype.follow = function (target) {};

    Monster.prototype.avoid = function (target) {};

    Monster.prototype.travel = function (x, y) {};

    Monster.prototype.getSpeed = function () {
        return this.abilities.speed;
    };

    Monster.prototype.getArmorClass = function () {
        // TODO: Add armor bonus to AC.
        // TODO: Add shield bonus to AC.
        // TODO: Add size modifier to AC.
        return this.getBaseAbilityMod('dexterity');
    };

    /*
     * Given an ability, use the d20 method for determining an ability modifier.
     */
    Monster.prototype.getBaseAbilityMod = function (abilityName) {
        if(typeof this.abilities[abilityName] === 'number') {
            return Math.floor(this.abilities[abilityName] / 2) - 5;
        }

        // If I dont' have that ability, return 0.
        return 0;
    };

    Monster.prototype.rollToHitMelee = function () {
        return this.getBaseAbilityMod('strength') + Dice.roll('1d20') + this.stats.baseAttackBonus;
    };

    Monster.prototype.rollForDamage = function () {
        return Dice.roll(this.stats.baseDamage);
    };

    Monster.prototype.defend = function (targetNumber) {
        var ac = this.getArmorClass() + Dice.roll('1d20');
        game.log.print('ac: ', ac, ' tn: ', targetNumber);
        return ac > targetNumber;

        // return this.getArmorClass() + Dice.roll('1d20') > targetNumber;
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

    Monster.prototype.calculateStats = function () {
        if(this.stats.level === 1) this.health = Dice.getSides(this.stats.hitDie);
        for(var i=1; i<this.stats.level; i++) {
            this.health += Dice.roll(this.stats.hitDie);
        }
        this.maxHealth = this.health;
        // game.log.print(this.name, ' has ', this.health);
    };

    return Monster;
});