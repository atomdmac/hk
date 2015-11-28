(function () {
    'use strict';

    requirejs.config({
        baseUrl: "src/",
        
        paths: {
            //  Edit the below path to point to where-ever you have placed the phaser.min.js file
            phaser: 'libs/phaser/build/phaser.min',
            rot: 'libs/rot.js/rot'
        },

        shim: {
            'phaser': {
                exports: 'Phaser'
            },
            'rot': {
                exports: 'ROT'
            }
        }
    });
 
    require(['phaser', 'game'], function (Phaser, Game) {
        var game = new Game();
        game.start();
    });
}());