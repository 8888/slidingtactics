'use strict';

let PlayField = require('../model/playfield.js');

class SlidingTacticsController {
    constructor() {
        this.playfields = [];
    }

    playfieldAdd(containerElementId) {
        let pf = new PlayField(containerElementId, localStorage.getItem('user_is_guest'));
        this.playfields.push(pf);
    }

    play() {
        for(let i = 0; i < this.playfields.length; i++) {
            let p = this.playfields[i];
            p.play();
        }
    }
}

module.exports = SlidingTacticsController;