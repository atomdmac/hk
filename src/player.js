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
        this.inventory = [];

    }

    Player.prototype = Object.create(Monster.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.defend = function () {
        // You block 50% of the time.
        return Math.random() > 0.5;
    };

    return Player;
});