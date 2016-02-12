define(
['phaser',
 'rot'], 
function (Phaser, ROT) {
	
	function Dice () {}

	Dice.roll = function (dice) {
		var parsed = dice.split('d'),
			count  = parseInt(parsed[0], 10),
			sides  = parseInt(parsed[1], 10),
			total  = 0;
		for(var i=0; i<count; i++) {
			total += ROT.RNG.getUniformInt(1, sides);
		}
		return total;
	};

	Dice.getCount = function (dice) {
		var parsed = dice.split('d');

		// If no count specified, assume 1.
		if(parsed.length === 1) {
			return 1;
		} else {
			return parseInt(parsed[1], 10);
		}
	};

	Dice.getSides = function (dice) {
		var parsed = dice.split('d');
		if(parsed.length === 1) {
			return parseInt(parsed[0], 10);
		} else {
			return parseInt(parsed[1], 10);
		}
	};

	return Dice;

});