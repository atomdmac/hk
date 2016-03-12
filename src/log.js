define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function Log (_game, x, y, key) {    
        game = _game;

        Phaser.Sprite.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Log';

    }

    Log.prototype = Object.create(Phaser.Sprite.prototype);
    Log.prototype.constructor = Log;

    Log.prototype.print = function () {
        // Print to console.
        // console.log.apply(console, arguments);
        // TODO: Provide in-game log UI :P
    };

    return Log;
});