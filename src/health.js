define([
    'phaser',
    'rot',
    'entity'
], function (Phaser, ROT, Entity) { 
    'use strict';

    // Private vars.
    var game;

    function Health (_game, x, y, key) {    
        game = _game;

        Entity.call(this, game, x, y, key || 'health');

        // Identifying information
        this.name = 'Health Pack';
        this.tags.health = true;
        this.tags.consumable = true;

        this.count = 1;

    }

    Health.prototype = Object.create(Entity.prototype);
    Health.prototype.constructor = Health;

    Health.prototype.use = function (target) {
        game.engine.lock();
        if(target.heal(3, this)) this.kill();
    };

    Health.prototype.kill = function () {
        Entity.prototype.kill.call(this);
        game.engine.unlock();
    };

    return Health;
});