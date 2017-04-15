'use strict';

class Trail {
    constructor(start, end) {
        this.startX = start % 16;
        this.startY = Math.floor(start / 16);
        this.endX = end % 16;
        this.endY = Math.floor(end / 16);
        this.duration = 250;
        this.cycle = 250;
        this.width = 5;
        this.isActive = true;
    }

    update(delta) {
        this.cycle -= delta;
        if (this.cycle <= 0) {
            this.width -= 1;
            if (this.width < 1) {
                this.isActive = false;
            } else {
                this.cycle = this.duration;
            }
        }
    }
}

module.exports = Trail;