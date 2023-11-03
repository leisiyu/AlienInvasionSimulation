
Character = require('./Character.js').Character

class Townfolk extends Character{
	constructor(name, position) {
		super(name, position);
	}
}

module.exports = {
	Townfolk,
}