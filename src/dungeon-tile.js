define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function DungeonTile (layer, type, x, y, width, height) {    
        game = layer.game;

        Phaser.Tile.call(this, layer, type, x, y, width, height);

        this.contents = [];

        // Signals

    }

    DungeonTile.prototype = Object.create(Phaser.Tile.prototype);
    DungeonTile.prototype.constructor = DungeonTile;

    DungeonTile.prototype.add = function (entity) {
        var index = this.contents.indexOf(entity);
        if(index !== -1) this.contents.push(entity);
    };

    DungeonTile.prototype.remove = function (entity) {
        var index = this.contents.indexOf(entity);
        if(index !== -1) this.contents.splice(index, 1);
    };

    DungeonTile.prototype.contains = function (entity) {
        for(var i=0; i<this.contents.length-1; i++) {
            if(this.contents[i] === entity) return true;
        }
        return false;
    };

    DungeonTile.prototype.containsType = function (type) {
        for(var i=0; i<this.contents.length-1; i++) {
            if(this.contents[i].tags[type]) return true;
        }
        return false;
    };

    DungeonTile.prototype.getAll = function (type, output) {
        output = output || [];
        for(var i=0; i<this.contents.length-1; i++) {
            if(this.contents[i].tags[type]) output.push(this.contents[i]);
        }
        return output;
    };

    return DungeonTile;
});