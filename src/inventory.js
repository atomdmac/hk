define([
    'phaser',
    'rot'
], function (Phaser, ROT) { 
    'use strict';

    // Private vars.
    var game;

    function Inventory (_game, parent) {

        game = _game;

        // The owner of this inventory.
        this.parent = parent;

        // Inventory
        this.items = [];

        // Signals.
        this.onAdd = new Phaser.Signal();
        this.onRemove = new Phaser.Signal();
        this.onConsume = new Phaser.Signal();
    }

    // Use the specified item or an item with the given name or type.
    // Consumable items will be automatically removed from the inventory.
    // item = name, type or Item reference.
    // Return TRUE if used, FALSE if not.
    Inventory.prototype.use = function (item) {};

    // item = name, type or Item reference.
    // Return TRUE if we have an item with that name, type or reference.
    Inventory.prototype.contains = function (item) {};

    // Return a list of items matching the given type.
    Inventory.prototype.getAll = function (itemType) {};

    // Return a reference to the item with the given name.
    Inventory.prototype.get = function (itemName) {};

    function Item (_game, parent) {
        this.name  = '';
        this.type  = '';
        this.count = 1;
        this.consumable = true;
    }

    Item.prototype.use = function () {};

    return Inventory;
});