define([
    'phaser',
    'rot',
    'entity'
], function (Phaser, ROT, Entity) { 
    'use strict';

    // Private vars.
    var game;

    function Ammo (_game, x, y, key) {    
        game = _game;

        Entity.call(this, game, x, y, key || 'ammo');

        // Identifying information
        this.name = 'Ammo Pack';
        this.tags.Ammo = true;
        this.tags.consumable = true;

        this.count = 1;

    }

    Ammo.prototype = Object.create(Entity.prototype);
    Ammo.prototype.constructor = Ammo;

    Ammo.prototype.use = function (target) {
        game.engine.lock();
        target.equipment.rightHand.reload(8);
        this.kill();
    };

    Ammo.prototype.kill = function () {
        Entity.prototype.kill.call(this);
        game.engine.unlock();
    };

    return Ammo;
});