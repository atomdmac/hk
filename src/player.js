define([
    'phaser',
    'rot',
    'monster',
    'bullet'
], function (Phaser, ROT, Monster, Bullet) { 
    'use strict';

    // Private vars.
    var game;

    function Player (_game, x, y, key) {    
        game = _game;

        Monster.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Player';
        this.tags.player = true;

        // Abilities
        this.abilities.strength     = 10;
        this.abilities.dexterity    = 10;
        this.abilities.constitution = 10;
        this.abilities.intelligence = 10;
        this.abilities.wisdom       = 10;
        this.abilities.charisma     = 10;
        this.abilities.speed        = 10;

        // Combat stats.
        this.stats.level   = 1;
        this.stats.hitDie  = '1d12';
        this.stats.baseDamage = '1d3';
        this.stats.baseAttackBonus = 3;


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

        // Set to TRUE when the player has provided input and an action is pending
        // (like a bullet flying through the air).
        this.isActing = false;

    }

    Player.prototype = Object.create(Monster.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.act = function () {
        game.engine.lock();
    };

    Player.prototype.fire = function (direction) {
        this.isActing = true;

        // Create the bullet and place it in the game world.
        var bullet = new Bullet(game, this.x, this.y, 'bullet');
        bullet.setLevel(this.level);
        bullet.teleport(this.tile.x, this.tile.y);
        game.add.existing(bullet);

        // When the bullet is removed from the map, the player's turn is over.
        var self = this;
        bullet.events.onKilled.add(function () {
            self.isActing = false;
        });


        bullet.fire(direction);
        return true;
    };

    return Player;
});