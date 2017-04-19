'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js'),
    PlayField = require('../model/playfield.js');

class SlidingTacticsController {
    constructor() {
        this.playfields = [];
    }

    playfieldAdd(containerElementId) {
        let pf = new PlayField(containerElementId);
        this.playfields.push(pf);
    }
}

module.exports = SlidingTacticsController;