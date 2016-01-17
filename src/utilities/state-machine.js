define(
['phaser'], 
function (Phaser) {
	
	function StateMachine () {
		this.currentState = null;
		this.states = {};
		this.onStateChange = new Phaser.Signal();
		this.onHandle = new Phaser.Signal();
	}

	StateMachine.extend = function (parent) {
		var sm = parent.stateMachine = new StateMachine();
		sm.parent = parent;
	};

	StateMachine.prototype.setState = function (name) {
		if (!this.states[name]) throw ('State "' + name + '" does not exist.');
		if(this.hasState(this.currentState) && typeof this.states[this.currentState].onExit === 'function') {
			this.states[this.currentState].onExit.call(this, name);
		}
		if(this.hasState(name) ) {
			this.currentState = name;

			if(typeof this.states[this.currentState].onEnter === 'function') {
				this.states[this.currentState].onEnter.call(this, name);
			}

			// Let listeners know that the state changed.
			this.onStateChange.dispatch(this, name);
		}

	};

	StateMachine.prototype.getState = function () {
		return this.currentState;
	};

	StateMachine.prototype.hasState = function (stateName) {
		return (typeof this.states[stateName] === 'object');
	};

	StateMachine.prototype.handle = function (method) {
		if(typeof this.states[this.currentState][method] === 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			this.states[this.currentState][method].call(this.parent || this, args);
			this.onHandle.dispatch(this, method);
		}
	};

	return StateMachine;

});