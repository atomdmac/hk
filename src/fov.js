define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    function FOV (game, origin, radius, lightPassesCb, computeCb) {
        var self = this;

        this.game = game;
        
        // The entity for which we are computing FOV.
        this.origin = origin;

        // The sight radius.
        this.radius = radius;

        // A cache of the tiles in the most recently computer FOV.
        this.current =  {};

        // Save callbacks
        this.computeCb = computeCb;
        
        // Create FOV.
        this.fov = new ROT.FOV.PreciseShadowcasting(lightPassesCb);

        // Events
        this.events = {};
        this.events.onUpdate = new Phaser.Signal();

    }

    FOV.prototype.update = function () {

        var self = this;

        // Clear existing FOV.
        for(var c in self.current) {
            if(self.current.hasOwnProperty(c)) {
                self.current[c].hide();
                delete self.current[c];
            }
        }

        // Create new FOV.
        var tile;
        self.fov.compute(this.origin.tile.x, this.origin.tile.y, this.radius, function(x, y, r, visibility) {
            // Add to the cache.
            tile = self.game.level.getTile(x, y);

            // Invoke external callbacks if necessary.
            if(typeof self.computeCb === 'function') {
                self.computeCb.call(this, x, y, r, visibility);
            }

            // Save the tile to the cache.
            self.current[x+'_'+y] = tile;

        });

        // Tell listeners that FoV has been updated.
        this.events.onUpdate.dispatch(this);
    };

    FOV.prototype.canSee = function (x, y) {
        if(this.current[x+'_'+y] !== undefined) return true;
        return false;
    };

    return FOV;

});