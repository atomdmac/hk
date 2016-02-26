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

        // Identifying information
        this.tags.door = true;
        this.tags.passable = false;

        this.frame = 2;

        this._open = false;
        this.__defineGetter__('isOpen', function () { return this._isOpen; });
        this.__defineSetter__('isOpen', function (newValue) { 
            if(this.isLocked) {
                console.log('Locked :(');
                return;
            }
            this._isOpen = newValue;
            if(this._isOpen) this.frame = 3;
            else this.frame = 2;
            this.events.onOpen.dispatch(this);
        });

        this._isLocked = false;
        this.__defineGetter__('isLocked', function () { return this._isLocked; });
        this.__defineSetter__('isLocked', function (newValue) { 
            this._isLocked = newValue;
        });

        // Signals
        this.events.onOpen = new Phaser.Signal();
        this.events.onClose = new Phaser.Signal();

    }

    Door.prototype = Object.create(Entity.prototype);
    Door.prototype.constructor = Door;

    Door.prototype.open = function () {
        if (!this.isOpen) {
            this.isOpen = true;
            this.tags.passable = true;
            if(this.tile) this.tile.setCollision(false, false, false, false);
            return true;
        } else {
            return false;
        }
    };

    Door.prototype.close = function () {
        // Can only close an open door...
        if(this.isOpen) {
            if(this.tile && this.tile.collides) {
                game.log.print('You try to close the door but the way is blocked...');
                return false;
            } else {
                this.isOpen = false;
                this.tags.passable = false;
                if(this.tile) this.tile.setCollision(true, true, true, true);
                return true;
            }
        } else {
            return false;
        }
    };

    Door.prototype.show = function () {
        if(this.visibilityTween) {
            this.visibilityTween.stop();
        }
        this.visibilityTween = game.add.tween(this);
        this.visibilityTween.to({alpha: 1}, 100, 'Linear', true);
    };

    Door.prototype.hide = function () {
        if(this.visibilityTween) {
            this.visibilityTween.stop();
        }
        this.visibilityTween = game.add.tween(this);
        if(this.tile && this.tile.discovered) {
            this.visibilityTween.to({alpha: 0.5}, 100, 'Linear', true);
        } else {
            this.visibilityTween.to({alpha: 0}, 100, 'Linear', true);
        }
    };

    return Door;
});