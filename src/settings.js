define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    return {
        turnPause: 175,
        time: {
            // A speed constant that grants instant priority in the scheduler.
            instant: 999999999
        },
        map: {
            width: 80,
            height: 40,
            tile: {
                width: 32,
                height: 32
            }
        },
        stage: {
            width: 1000,
            height: 800
        }
    };
});