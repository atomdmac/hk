define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game,
        INFINITY = 9999999999,
        IMPASSABLE = -1;

    function Flow (width, height, passableCallback) {

        game = _game;
        var self = this;

        this.width = width;
        this.height = height;
        this.cells = {};
        this.passableCallback = passableCallback || function () { return true; };
    }

    Flow.prototype.update = function (x, y, maxDistance, distance) {
        // Distance from center point.
        distance = distance === undefined ? 0 : distance = -1;

        // Out of range?
        if(distance > maxDistance)   return;
        if(x < 0 || x > this.width)  return;
        if(y < 0 || y > this.height) return;

        // If it can be visited, mark this tile as visited.
        if(this.passableCallback(x, y)) {
            distance++;
            this.cells[x+'_'+y] = distance;
        }
        
        // Otherwise, mark it as not passable.
        else this.cells[x+'_'+y] = IMPASSABLE;

        // Mark all neighbors.
        this.forEachNeighbor(x, y, this.update, maxDistance, distance);

    };

    Flow.prototype.forEachNeighbor = function (x, y, callback, maxDistance, distance) {
        
        // Set param defaults.
        maxDistance = maxDistance === undefined ? 0 : maxDistance;
        distance = distance === undefined ? 0 : distance;

        // Loop through neighbors.
        var n = 0,
            dirs = ROT.DIRS[8],
            neighborDistance;
        for(; n<dirs.length; n++) {
            x = dirs[0];
            y = dirs[1];
            neighborDistance = this.cells[x+'_'+y];
            if(neighborDistance && neighborDistance <= distance) {
                callback.apply(this, x, y, maxDistance, distance);
            }
        }
    };

    // Get the next uphill tile from this position.
    Flow.prototype.upHill = function (x, y) {
        var largetDistance, result;
        this.forEachNeighbor(x, y, function (x, y, maxDistance, distance) {
            if(distance > largest) {
                largest = distance;
                result  = {x:x, y:y};
            }
        });
        return result;
    };

    // Get the next downhill tile from this position.
    Flow.prototype.downHill = function (x, y) {};

    Flow.prototype.invert = function () {};

    Flow.prototype.reset = function () {
        for(var cell in cells) delete cells[cell];
    };

    return Flow;
});