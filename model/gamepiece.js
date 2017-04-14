'use strict';

class GamePiece {
    constructor() {
        this.x = null;
        this.y = null;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }
}

module.exports = GamePiece;