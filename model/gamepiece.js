'use strict';

class GamePiece {
    constructor(color) {
        this.x = null;
        this.y = null;
        this.color = color;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }
}

module.exports = GamePiece;