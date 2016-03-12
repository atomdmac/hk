define([
    'phaser',
    'rot',
    'monster',
    'gun',
    'bullet'
], function (Phaser, ROT, Monster, Gun, Bullet) { 
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

        // DEBUG: Start with a gun.
        var gun = new Gun(game, 0, 0, null, this);
        gun.pickup(this);
        this.equip(gun, 'rightHand');

        // Set to TRUE when the player has provided input and an action is pending
        // (like a bullet flying through the air).
        this.isActing = false;

    }

    Player.prototype = Object.create(Monster.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.act = function () {
        game.engine.lock();
    };

    Player.prototype.move = function (direction, skipAnimation) {
        var newTileX = this.tile.x + direction.x,
            newTileY = this.tile.y + direction.y;

        var item = this.level.containsItem(newTileX, newTileY);
        if(item) item.use(this);
        return Monster.prototype.move.call(this, direction, skipAnimation);
    };

    Player.prototype.equip = function (item, slot) {
        if(this.equipment[slot] === undefined) return false;
        this.equipment[slot] = item;
    };

    Player.prototype.reload = function () {
        return this.equipment.rightHand.reload();
    };

    Player.prototype.fire = function (direction) {

        // TODO: Don't assume projecttile weapon is equiped.
        var result = this.equipment.rightHand.fire(direction);

        // If weapon used successfully, release engine lock.
        if(result) game.engine.unlock();

        return result;
    };

    return Player;
});