define([
    'phaser',
    'rot',
    'entity'
], function (Phaser, ROT, Entity) { 
    'use strict';

    // Private vars.
    var game;

    function Door (_game, x, y) {    
        game = _game;

        Entity.call(this, game, x, y, 'dungeon');

        this.frame = 2;

        this._open = false;
        this.__defineGetter__('isOpen', function () { return this._isOpen; });
        this.__defineSetter__('isOpen', function (newValue) { 
            this._isOpen = newValue;
            if(this._isOpen) this.frame = 3;
            else this.frame = 2;
            this.events.onOpen.dispatch(this);
        });

        // Signals
        this.events.onOpen = new Phaser.Signal();
        this.events.onClose = new Phaser.Signal();

    }

    Door.prototype = Object.create(Entity.prototype);
    Door.prototype.constructor = Door;

    Door.prototype.open = function () {
        if (!this.isOpen) this.isOpen = true;
    };

    Door.prototype.close = function () {
        if(this.isOpen) this.isOpen = false;
    };

    return Door;
});