'use strict';

class SharedUtilities {
    constructor() {
        this.EAST = new Direction("East", 4, 1, 0);
        this.NORTH = new Direction("North", 1, 0, -1);
        this.WEST = new Direction("West", 8, -1, 0);
        this.SOUTH = new Direction("South", 2, 0, 1);
    }
}