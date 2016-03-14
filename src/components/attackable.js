define([
    'phaser',
    'rot',
    'entity'
], function (Phaser, ROT, Entity) { 
    'use strict';

    // Private vars.
    var game, target;

    function Component (_game, x, y, key, _target) {    
        game = _game;

        // The point/target to bind this component to.
        target = _target;
        // Extending components should contain this line.
        // target.[componentName] = this;
    }

    Component.prototype.constructor = Component;

    Component.prototype.update = function () {};

    return Component;
});