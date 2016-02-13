define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function CombatFloater (_game, x, y) {    
        game = _game;
        Phaser.Group.call(this, _game, x, y, null);
    }

    CombatFloater.prototype = Object.create(Phaser.Group.prototype);
    CombatFloater.prototype.constructor = CombatFloater;

    CombatFloater.prototype.hit = function (amount) {
        var text = game.add.text(this.parent.x, this.parent.y, amount, {fill: 'red', fontSize: '60px'}),
            tween = game.add.tween(text);
        tween
            .to({y: this.parent.y - 100, alpha: 0}, 1000, Phaser.Easing.Quadratic.easeOut, true)
            .onComplete.add(function () {
                text.kill();
            });
    };

    CombatFloater.prototype.miss = function () {
        var text = game.add.text(this.parent.x, this.parent.y, 'Miss!', {fill: 'yellow', fontSize: '12px'}),
            tween = game.add.tween(text);

        tween
            .to({y: this.parent.y - 100, alpha: 0}, 800, Phaser.Easing.Quadratic.easeOut, true)
            .onComplete.add(function () {
                text.kill();
            });
    };

    return CombatFloater;
});