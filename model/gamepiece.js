'use strict';

class GamePiece {
    constructor(color) {
        this.x = null;
        this.y = null;
        this.color = color;
    }

    setLocation(locationIndex) {
        this.location = locationIndex;
    }
}

module.exports = GamePiece;