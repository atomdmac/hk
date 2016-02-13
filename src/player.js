define([
    'phaser',
    'rot',
    'monster'
], function (Phaser, ROT, Monster) { 
    'use strict';

    // Private vars.
    var game;

    function Player (_game, x, y, key) {    
        game = _game;

        Monster.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Player';
        this.tags.player = true;

        // Stats
        this.health = 20;
        this.maxHealth = this.health;

        // Abilities
        this.abilities = {};
        this.abilities.strength     = 10;
        this.abilities.dexterity    = 10;
        this.abilities.constitution = 10;
        this.abilities.intelligence = 10;
        this.abilities.wisdom       = 10;
        this.abilities.charisma     = 10;

        // Combat stats.
        this.stats = {};
        this.stats.level   = 1;
        this.stats.hitDie  = '1d6';
        this.stats.baseDamage = '1d6';

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
        this.inventory = [];

    }

    Player.prototype = Object.create(Monster.prototype);
    Player.prototype.constructor = Player;

    return Player;
});