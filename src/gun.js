define([
    'phaser',
    'rot',
    'entity',
    'bullet'
], function (Phaser, ROT, Entity, Bullet) { 
    'use strict';

    // Private vars.
    var game;

    function Gun (_game, x, y, key, parent) {    
        game = _game;

        Entity.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Gun';

        // Ammo specs.
        this.totalAmmo = 16;
        this.clipSize = 8;
        this.currentClip = 8;

        // Events
        this.events.onUse = new Phaser.Signal();

    }

    Gun.prototype = Object.create(Entity.prototype);
    Gun.prototype.constructor = Gun;

    Gun.prototype.reload = function (amount) {
        if(amount > 0) this.totalAmmo += amount;
        
        if(this.totalAmmo <= 0) {
            game.log.print('You don\'t have any ammo left!');
            return false;
        }
        // How much to pull from ammo pool.
        var amountToUse = this.clipSize - this.currentClip;
        if(amountToUse > this.totalAmmo) amountToUse = this.totalAmmo;
        this.currentClip += amountToUse;
        this.totalAmmo -= amountToUse;

        game.log.print(this.name, 'is reloaded (', this.currentClip, '/', this.clipSize, '/', this.totalAmmo, ')');

        return true;
    };

    Gun.prototype.pickup = function (newParent) {
        // No longer needs to be in the game world since it's been picked up.
        if(this.tile) this.tile.remove(this);

        // This gun is already owned by someone.
        if(this.parent) {
            game.log.print('Someone is already holding ', this.name);
        } 

        // Attach this gun to the new parent.
        else {
            newParent.addChild(this);
            this.x = 0;
            this.y = 0;
            this.exists = false;
        }
    };

    Gun.prototype.drop = function (tile) {
        if(this.parent) {
            this.parent.removeChild(this);
            game.log.print(this.parent.name, 'drops the ', this.name);
        }
        this.exists = true;
        this.teleport(tile.x, tile.y);
    };

    Gun.prototype.fire = function (direction) {
        // Do we have enough ammo to fire?
        if(this.currentClip === 0) {
            game.log.print('The gun is out of ammo!');
            return false;
        }

        // Decrement ammo.
        this.currentClip--;

        // Create the bullet and place it in the game world.
        var bullet = new Bullet(game, this.parent.x, this.parent.y, 'bullet');
        bullet.setLevel(this.parent.level);
        bullet.teleport(this.parent.tile.x, this.parent.tile.y);
        game.add.existing(bullet);

        // Fire ze mis-iles!
        game.scheduler.add(bullet, false);
        bullet.fire(direction);

        // Fired successfully!
        return true;
    };

    return Gun;
});