define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    function FOV (game) {
        var self = this;

        this.game = game;
        this.current =  {};

        var lightPasses = function (x, y) {
            if(self.game.level.isPassable(x, y)) return true;
            return false;
        };
        
        this.fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
    }
    FOV.prototype.update = function (x, y, r) {

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
        self.fov.compute(x, y, r, function(x, y, r, visibility) {
            tile = self.game.level.getTile(x, y);
            tile.show();
            self.current[x+'_'+y] = tile;
        });
        tile.layer.dirty = true;
    };

    FOV.prototype.canSee = function (x, y) {
        if(this.current[x+'_'+y] !== undefined) return true;
        return false;
    };

    return FOV;

});