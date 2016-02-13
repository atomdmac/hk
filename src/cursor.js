define([
    'phaser',
    'rot',
    'entity'
], function (Phaser, ROT, Entity) { 
    'use strict';

    // Private vars.
    var game;

    function Cursor (_game, x, y, key) {    
        game = _game;

        Entity.call(this, game, x, y, key);

        // Identifying information
        this.name = 'cursor';
        this.tags.cursor = true;

        // The point/target to bind this cursor to.
        this.target = null;

        // The maximum distance that the cursor can travel relative to the target.
        // Measured in tiles.
        this.maxDistance = 5;
    }

    Cursor.prototype = Object.create(Entity.prototype);
    Cursor.prototype.constructor = Cursor;

    Cursor.prototype.show = function () {};
    Cursor.prototype.hide = function () {};

    return Cursor;
});