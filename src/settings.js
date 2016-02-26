define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    return {
        turnPause: 100,
        map: {
            width: 80,
            height: 40,
            tile: {
                width: 64,
                height: 64
            }
        },
        stage: {
            width: 1000,
            height: 800
        }
    };
});