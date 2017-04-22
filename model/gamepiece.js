'use strict';

class GamePiece {
    constructor() {
    }

    setLocation(locationIndex) {
        if (locationIndex != this.location) {
            this.isDirty = true;
            this.locationPrevious = {
                x: this.x,
                y: this.y
            };
            this.location = locationIndex;
            this.y = Math.floor(this.location / 16);
            this.x = this.location % 16;
        }
    }
}

module.exports = GamePiece;