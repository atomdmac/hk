define([
    'phaser',
    'rot',
    'settings',
    'entity'
], function (Phaser, ROT, Settings, Entity) { 
    'use strict';

    // Private vars.
    var game;

    function Cursor (_game, target) {    
        game = _game;

        Entity.call(this, game, 0, 0, 'cursor');

        // Identifying information
        this.name = 'cursor';
        this.tags.cursor = true;

        // The point/target to bind this cursor to.
        this.target = target;

        // The maximum distance that the cursor can travel relative to the target.
        // Measured in tiles.
        this.maxDistance = 1.5;
    }

    Cursor.prototype = Object.create(Entity.prototype);
    Cursor.prototype.constructor = Cursor;

    Cursor.prototype.move = function (direction) {
        var distance = new Phaser.Point(
            (this.tile.x + direction.x) - this.target.tile.x, 
            (this.tile.y + direction.y) - this.target.tile.y
        );
        if(distance.getMagnitude() <= this.maxDistance) {
            Entity.prototype.move.call(this, direction);
        } else {
            return false;
        }
    };

    Cursor.prototype.show = function () {};
    Cursor.prototype.hide = function () {};

    return Cursor;
});