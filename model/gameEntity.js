'use strict';

class GameEntity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    init() { }

    eventListenersAttach() { }

    update(delta) { }

    display(ctx) { }
}

module.exports = GameEntity;