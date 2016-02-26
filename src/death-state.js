define([
    'phaser',
    'rot',
], function (Phaser, ROT) { 
    'use strict';

    var game, text, data;

    return {

    	init: function (_data) {
    		console.log(_data);
    		data = _data;
    	},

    	create: function () {
    		game = this.game;
    		text = game.add.text(this.stage.width / 2, this.stage.height / 2,
    			'You died after ' + Math.round(data.turns) + ' minutes on Floor ' + data.level,
    			{fill: 'red', fontSize: '50px', align: 'center'});
    		text.setShadow(2, 2, "red", 20, false, true);
    		text.anchor.set(0.5);
    	}
    };


});