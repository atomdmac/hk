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
                width: 16,
                height: 16
            }
        },
        stage: {
            width: 1000,
            height: 800
        }
    };
});