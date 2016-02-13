define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function ProgressBar (_game, x, y) {    
        game = _game;

        this._drawSize = {
            width:  50,
            height: 10
        };

        this.min = 0;
        this.max = 100;

        this.barBg = new Phaser.Graphics(game, 0, 0);

        Phaser.Sprite.call(this, game, 0, 0, this.barBg.generateTexture());

        this.bar = new Phaser.Graphics(game, 0, 0);
        this.addChild(this.bar);

        this.updateDisplay();
    }

    ProgressBar.prototype = Object.create(Phaser.Sprite.prototype);
    ProgressBar.prototype.constructor = ProgressBar;

    ProgressBar.prototype.setSize = function (width, height) {
        this._drawSize.width = width;
        this._drawSize.height = height;
        this.updateDisplay();
    };

    ProgressBar.prototype.setMin = function (value) {
        this.min = value;
        this.updateDisplay();
    };

    ProgressBar.prototype.setMax = function (value) {
        this.max = value;
        this.updateDisplay();
    };

    ProgressBar.prototype.setProgress = function (value) {
        this.progress = value;
        this.updateDisplay();
    };

    ProgressBar.prototype.updateDisplay = function () {
        this.barBg.clear();
        this.barBg.beginFill(0xffffff);
        this.barBg.drawRect(0, 0, this._drawSize.width, this._drawSize.height);
        this.setTexture(this.barBg.generateTexture(), true);
        this.resizeFrame(this, this._drawSize.width, this._drawSize.height);

        var barWidth = (this.progress * this._drawSize.width) / this.max;
        this.bar.clear();
        this.bar.beginFill(0xff0000);
        this.bar.drawRect(0, 0, barWidth, this._drawSize.height);

    };

    return ProgressBar;
});