define([
    'phaser',
    'rot',
    'monster',
    'utilities/state-machine',
    'progress-bar',
    'utilities/dice'
], function (Phaser, ROT, Monster, StateMachine, ProgressBar, Dice) { 
    'use strict';

    // Private vars.
    var game;

    function Undead (_game, x, y, key) {    
        game = _game;

        Monster.call(this, game, x, y, key);

        // Identifying information
        this.name = 'Undead';
        this.tags.undead = true;
        this.tags.passable = false;
        

        // Abilities
        this.abilities.strength     = 12;
        this.abilities.dexterity    = 3;
        this.abilities.constitution = 0;
        this.abilities.intelligence = 0;
        this.abilities.wisdom       = 10;
        this.abilities.charisma     = 1;
        this.abilities.speed        = 6;

        // Combat stats.
        this.stats.level   = 1;
        this.stats.hitDie  = '1d6';
        this.stats.baseDamage = '1d3';
        this.stats.baseAttackBonus = 3;

        // Skills

        // Equipment
        this.equipment.charm = null;
        this.equipment.head = null;
        this.equipment.torso = null;
        this.equipment.leftHand = null;
        this.equipment.rightHand = null;
        this.equipment.feet = null;

        // Inventory

        // Health display
        this.healthBar = new ProgressBar(game, 0, -2);
        this.healthBar.setSize(this.width, 2);
        this.healthBar.setMin(0);
        this.healthBar.setMax(this.maxHealth);
        this.healthBar.setProgress(this.health);

        this.addChild(this.healthBar);

        var self = this;
        this.events.onDamage.add(function (target, amount, attacker) {
            self.healthBar.setProgress(target.health);
        });

    }

    Undead.prototype = Object.create(Monster.prototype);
    Undead.prototype.constructor = Undead;

    // Called by the game scheduler.  Should return a "thenable" promise if we
    // need time to animate actions.
    Undead.prototype.act = function () {
        // If I can see the player, chase them immediately!
        if(game.player.fov.contains(this.tile.x, this.tile.y)/*this.canSee(game.player)*/ && game.player.alive) this._quary = game.player;
        // else, wander randomly.
        else if(Math.random() < 0.25) this._quary = this.level.getRandomPassable();

        this.moveToward(this._quary);

        return Monster.prototype.act.call(this);

    };

    // Undead.prototype.kill = function () {};

    Undead.prototype.follow = function (target) {};

    Undead.prototype.avoid = function (target) {};

    Undead.prototype.travel = function (x, y) {};

    // Used to determine whether another Undead is hostile to me or not.
    Undead.prototype.reactTo = function (target) {
        // Hostile to all targets except myself.
        return target.tags.undead ?  Monster.reactions.HELPFUL : Monster.reactions.HOSTILE;
    };

    Undead.prototype.setLevel = function (level) {
        Monster.prototype.setLevel.call(this, level);
        // Randomly wandor by default.
        this._quary = this.level.getRandomPassable();
    };


    return Undead;
});