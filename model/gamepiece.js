'use strict';

class GamePiece {
    constructor(color) {
        this.color = color;
    }

    setLocation(locationIndex) {
        this.location = locationIndex;
    }
}

module.exports = GamePiece;