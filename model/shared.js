'use strict';

class SharedUtilities {
    constructor() {
        this.EAST = new Direction("East", 4, 1, 0);
        this.NORTH = new Direction("North", 1, 0, -1);
        this.WEST = new Direction("West", 8, -1, 0);
        this.SOUTH = new Direction("South", 2, 0, 1);
    }

    directionReverse(direction) {
        if (direction == this.EAST) {
            return this.WEST;
        }
        else if (direction == this.WEST) {
            return this.EAST;
        }
        else if (direction == this.NORTH) {
            return this.SOUTH;
        }
        else if (direction == this.SOUTH) {
            return this.NORTH;
        }
    }
}