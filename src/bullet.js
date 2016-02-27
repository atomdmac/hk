define([
    'phaser',
    'rot',
    'monster'
], function (Phaser, ROT, Monster) { 
    'use strict';

    // Private vars.
    var game;

    function Bullet (_game, x, y, key, owner) {    
        game = _game;

        Monster.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Bullet';
        this.tags.Bullet = true;

        this.bringToTop();

        this.owner = owner;

    }

    Bullet.prototype = Object.create(Monster.prototype);
    Bullet.prototype.constructor = Bullet;

    Bullet.prototype.act = function () {
        game.engine.lock();
    };

    Bullet.prototype.fire = function (direction) {
        var nextPos = new Phaser.Point(this.tile.x + direction.x, this.tile.y + direction.y),
            tween   = game.add.tween(this),
            self    = this;
        this.moveToward(nextPos);
        if(!this.movementTween) return;
        this.movementTween.onComplete.add(function () {
            if(self.alive) self.fire(direction);
        });
    };

    Bullet.prototype.moveToward = function (target) {
        var targetPos = new Phaser.Point(),
            slope = new Phaser.Point(),
            targetDir = new Phaser.Point();
        // Given coords instead of target object.
        if(arguments.length > 1) {
            targetPos.x = arguments[0];
            targetPos.y = arguments[1];
        } else {
            // Attempt to use tile property if available.
            targetPos.x = target.tile ? target.tile.x : target.x;
            targetPos.y = target.tile ? target.tile.y : target.y;
        }

        // Calculate slope.
        Phaser.Point.subtract(targetPos, this.tile, slope);
        Phaser.Point.normalize(slope, slope);

        targetDir.x = Math.round(slope.x);
        targetDir.y = Math.round(slope.y);

        var hasMoved;

        // Attempt to move to next position.
        this.move(targetDir);
    };

    // Return TRUE if an action was taken as a result of a collision.
    Bullet.prototype.handleObjectCollision = function (tile) {
        // See if another monster is blocking the way.
        var monster = this.level.containsMonster(tile.x, tile.y);
        if(monster && monster.tags.passable === false) {
            // If they are, do we want to fight them?
            if(this.reactTo(monster) === 0) {
                var toHitRoll = this.rollToHitMelee();

                // Roll to hit.
                if(!monster.defend(toHitRoll)) {
                    monster.takeDamage(this.rollForDamage(), this);
                } 

                // Aw, I missed :()
                else {
                    this.combatFloater.miss();
                    game.log.print(this.name, ' attacks ', monster.name, 'but misses.');
                }
            }
            
            // Collision detected!
            this.tile.remove(this);
            this.kill();
            game.engine.unlock();

            return true;
        }

        // Looks like there wasn't anything to collide with.  No action taken.
        return false;
    };

    // TRUE if a collision occured with terrain.
    Bullet.prototype.handleTerrainCollision = function (tile) {
        var result = Monster.prototype.handleTerrainCollision.call(this, tile);
        if(result) {
            this.tile.remove(this);
            this.kill();
            game.engine.unlock();
        }
        return result;
    };

    return Bullet;
});