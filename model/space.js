'use strict';

class Space {
    constructor() {
        this.wallEast = null;
        this.wallNorth = null;
        this.wallWest = null;
        this.wallSouth = null;
    }

    addWall(wall) {
        // takes a Wall object
        if (wall.direction == Shared.EAST) {
            this.wallEast = wall;
        }
        else if (wall.direction == Shared.NORTH) {
            this.wallNorth = wall;
        }
        else if (wall.direction == Shared.WEST) {
            this.wallWest = wall;
        }
        else if (wall.direction == Shared.SOUTH) {
            this.wallSouth = wall;
        }
    }

    hasWall(direction) {
        // returns if the space has a wall at that direction
        for (let wall in this) {
            if (this[wall] && this[wall].direction == direction) {
                return true;
            }
        }
        return false;        
    }
}