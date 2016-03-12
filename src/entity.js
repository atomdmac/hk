define([
    'phaser',
    'rot',
    'settings',
    'combat-floater'
], function (Phaser, ROT, Settings, CombatFloater) { 
    'use strict';

    // Private vars.
    var game;

    function Entity (_game, x, y, key) {    
        game = _game;

        Phaser.Sprite.call(this, game, x, y, key);

        // A hash of tiles that the monster can see.
        this._visibleTiles = {};

        // The tile that the entity is currently on.
        this.tile = null;

        // Movement tween.
        this.movementTween = null;
        this.movementTweenDuration = null;

        // Identifying information
        this.name = 'Entity';
        // A list of 'types' or words describing this entity.  Example: 'monster', 'door';
        this.tags = {
            passable: true
        }; 
        
        // Stats
        this.health = 100;
        this.maxHealth = this.health;

        // Display combat results as floating text above this entity.
        this.combatFloater = new CombatFloater(game, 0, 0);
        this.addChild(this.combatFloater);

        // Cached reference to map (Phaser.TileMap instance)
        this.level = null;

        // Cached reference to other monsters on the level (Phaser.Group instance)
        this._monsters = null;

        // A Line instance representing the LoS between me and something I'm 
        // trying to see.
        this._losLine = new Phaser.Line();

        // Signals.
        this.events.onMove = new Phaser.Signal();
        this.events.onTeleport = new Phaser.Signal();
        this.events.onAttack = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();
        this.events.onHeal = new Phaser.Signal();
        this.events.onDie = new Phaser.Signal();
        this.events.onSee = new Phaser.Signal();
        this.events.onUnsee = new Phaser.Signal();
        this.events.onSpawnChild = new Phaser.Signal();
    }

    Entity.prototype = Object.create(Phaser.Sprite.prototype);
    Entity.prototype.constructor = Entity;

    Entity.prototype.setLevel = function (level) {
        this.level = level;
    };

    Entity.prototype.show = function () {
        if(this.visibilityTween) {
            this.visibilityTween.stop();
        }
        this.visibilityTween = game.add.tween(this);
        this.visibilityTween.to({alpha: 1}, 100, 'Linear', true);
    };

    Entity.prototype.hide = function () {
        if(this.visibilityTween) {
            this.visibilityTween.stop();
        }
        this.visibilityTween = game.add.tween(this);
        this.visibilityTween.to({alpha: 0}, 100, 'Linear', true);
    };
    
    Entity.prototype.canSee = function (target) {
        if(!this.level) return false;
        var los = this._losLine;
        if(arguments.length > 1) {
            los.start.x = this.x;
            los.start.y = this.y;
            los.end.x = arguments[0];
            los.end.y = arguments[1];
        } else {
            los.start.x = this.x;
            los.start.y = this.y;
            los.end.x = target.x;
            los.end.y = target.y;
        }

        //  Use target centers.
        los.start.x += this.level.tileWidth / 2;
        los.start.y += this.level.tileHeight / 2;
        los.end.x += this.level.tileWidth / 2;
        los.end.y += this.level.tileHeight / 2;

        var path = this.level.terrain.getRayCastTiles(los, 4, true);
        if(path.length) return false;
        return true;
    };

    Entity.prototype.moveToward = function (target) {
        var targetPos = new Phaser.Point(),
            slope = new Phaser.Point(),
            targetDir = new Phaser.Point(),
            skipAnimation;
        // Given coords instead of target object.
        if(typeof arguments[0] === 'number') {
            targetPos.x = arguments[0];
            targetPos.y = arguments[1];
            skipAnimation = arguments[2];
        } else {
            // Attempt to use tile property if available.
            targetPos.x = target.tile ? target.tile.x : target.x;
            targetPos.y = target.tile ? target.tile.y : target.y;
            skipAnimation = arguments[1];
        }

        skipAnimation = false;

        // Calculate slope.
        Phaser.Point.subtract(targetPos, this.tile, slope);
        Phaser.Point.normalize(slope, slope);

        targetDir.x = Math.round(slope.x);
        targetDir.y = Math.round(slope.y);

        var hasMoved;

        // Attempt to move to next position.
        hasMoved = this.move(targetDir, skipAnimation);

        // If we couldn't move to our ideal spot, let's find the next best thing.
        // Let's try moving horizontally first.
        if(!hasMoved && slope.x) {
            targetDir.x = Phaser.Math.sign(slope.x);
            targetDir.y = 0;
            hasMoved = this.move(targetDir, skipAnimation);
        }

        // Failing that, let's try vertically.
        if(!hasMoved && slope.y) {
            targetDir.x = 0;
            targetDir.y = Phaser.Math.sign(slope.y);
            hasMoved = this.move(targetDir, skipAnimation);
        }

        // What about diagonally?
        if(!hasMoved && !slope.x) {
            targetDir.x = 1;
            targetDir.y = Phaser.Math.sign(slope.y);
            hasMoved = this.move(targetDir, skipAnimation);
        }
        if(!hasMoved && !slope.x) {
            targetDir.x = -1;
            targetDir.y = Phaser.Math.sign(slope.y);
            hasMoved = this.move(targetDir, skipAnimation);
        }
        if(!hasMoved && !slope.y) {
            targetDir.x = Phaser.Math.sign(slope.x);
            targetDir.y = 1;
            hasMoved = this.move(targetDir, skipAnimation);
        }
        if(!hasMoved && !slope.y) {
            targetDir.x = Phaser.Math.sign(slope.x);
            targetDir.y = -1;
            hasMoved = this.move(targetDir, skipAnimation);
        }
    };
    
    Entity.prototype.updateVision = function () {};

    Entity.prototype.defend = function (victim) {
        // Always fail for now.
        return false;
    };

    Entity.prototype.heal = function (amount, source) {
        // Can't heal any more, captain!
        if(this.health === this.maxHealth) {
            game.log.print(this.name, 'is already fully healed.');
            return false;
        }

        this.health += amount;
        if(this.health > this.maxHealth) this.health = this.maxHealth;
        game.log.print(this.name, 'is healed for', amount, ' resulting in', this.health, '/', this.maxHealth, 'by', source.name);
        this.events.onHeal.dispatch(this, amount, source);
        return true;
    };

    Entity.prototype.takeDamage = function (amount, attacker) {
        // Take damage.
        this.health -= amount;

        // Let listeners know that we got a boo-boo :(
        this.events.onDamage.dispatch(this, amount, attacker);

        // TODO: For the love of JAZUS, clean up this damage tint code.
        this.tint = 0xff0000;
        var self = this;
        setTimeout(function () { self.tint = 0xffffff; }, Settings.turnPause);

        // Put it in the log.
        game.log.print(this.name, '[', this.health, '] takes ', amount, ' damage from ', attacker.name, '[', attacker.health, ']');

        // Did we die yet?
        if(this.health<=0) this.die();
    };

    Entity.prototype.die = function () {
        // Let listeners know
        this.events.onDie.dispatch(this);

        // Put it in the log.
        game.log.print(this.name, ' dies.');
        
        // Aaaaand die.
        this.kill();
    };

    // Return TRUE if an action was taken as a result of a collision.
    Entity.prototype.handleObjectCollision = function (tile) {
        // See if door is blocking the way.
        var door = this.level.containsDoor(tile.x, tile.y);
        if(door && !door.isOpen) {
            door.open();
            return true;
        }

        // See if another monster is blocking the way.
        var monster = this.level.containsMonster(tile.x, tile.y);
        if(monster && monster.tags.passable === false) {
            // If they are, do we want to fight them?
            if(this.reactTo(monster) === 0) {
                var toHitRoll = this.rollToHitMelee();

                // Attack animation.
                var newX = (monster.tile.x*Settings.map.tile.width)  - (this.tile.x*Settings.map.tile.width),
                    newY = (monster.tile.y*Settings.map.tile.height) - (this.tile.y*Settings.map.tile.height);
                newX /= 4;
                newY /= 4;
                newX += (this.tile.x * Settings.map.tile.width);
                newY += (this.tile.y * Settings.map.tile.height);

                var hitAnim = game.add.tween(this);
                hitAnim.to(
                    {
                        x: newX,
                        y: newY 
                    }, Settings.turnPause/2, 'Linear', true, 0, 0, true
                );

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
            return true;
        }

        // Looks like there wasn't anything to collide with.  No action taken.
        return false;

    };

    // TRUE if a collision occured with terrain.
    Entity.prototype.handleTerrainCollision = function (tile) {
            // We can't move there if the player is already there.
            if(game.level.containsPlayer(tile.x, tile.y)) return true;
            
            // Do not continue if terrain impassable.
            if(!this.level.isPassable(tile.x, tile.y)) return true;

            // No collision.
            return false;
    };

    // TRUE if movement occured or action was taken.
    Entity.prototype.move = function (direction, skipAnimation) {
        var newTileX = this.tile.x + direction.x,
            newTileY = this.tile.y + direction.y,
            newTile = this.level.getTile(newTileX, newTileY);

        // New tile doesn't exist.  Abort!
        if(!newTile) {
            return false;
        }

        // If this entity is impassable, let's do some collision detection.
        if(!this.tags.passable) {
            // If there's an object next to me, can I interact with it?
            if (this.handleObjectCollision(newTile)) return true;

            // If there's terrain next to me, do I collide with it?
            else if (this.handleTerrainCollision(newTile)) return false;

        }


        var oldTile = this.tile,
            oldTileX = this.tile.x,
            oldTileY = this.tile.y,
            oldX = this.x,
            oldY = this.y;
        
        // If I was on a tile previously, remove me from it.
        if(this.tile) this.tile.remove(this);

        // ...and then add me to the new tile.
        this.tile = newTile;
        this.tile.add(this);

        if(!skipAnimation) {
            this.movementTween = game.add.tween(this);
            this.movementTween.to({
                x: (this.tile.x * this.level.tileWidth),
                y: (this.tile.y * this.level.tileHeight)
            }, this.movementTweenDuration || Settings.turnPause, null, true);
        } else {
            this.x += (direction.x * this.level.tileWidth);
            this.y += (direction.y * this.level.tileHeight);
        }
        this.events.onMove.dispatch(this, oldTile, this.tile);
        return true;
    };

    Entity.prototype.teleport = function (x, y) {

        if(this.level && this.level.isPassable(x, y)) {
            if(this.tile) this.tile.remove(this);
            this.tile = this.level.getTile(x, y);
            this.tile.add(this);
            this.x = x * this.level.tileWidth;
            this.y = y * this.level.tileHeight;
            return true;
        }
        return false;
    };

    return Entity;
});