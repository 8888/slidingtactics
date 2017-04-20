'use strict';

let SlidingTacticsController = require('../client/index.js'),
    PlayField = require('../model/devPlayField.js');

class DevSlidingTacticsController extends SlidingTacticsController {

    playfieldAdd(containerElementId) {
        let pf = new PlayField(containerElementId, 20, 10);
        this.playfields.push(pf);
    }
}

module.exports = DevSlidingTacticsController;