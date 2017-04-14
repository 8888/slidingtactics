'use strict';

let t = require('../model/testUtility.js'),
    Shared = require('../model/wall.js');

class Board {
    constructor(name, type) {
        /*  name: string - id for this section(s)
            type: string - edition this board is from
        */
        t.assertString(name);
        t.assertString(type);

        this.name = name;
        this.type = type;
        this.area = [];
        this.goals = [];
    }

    item(index) {
        return this.area[index];
    }

    rotate(iterations, section) {
        iterations = t.defaultValue(iterations, 1);
        t.assertIntegerPositive(iterations);
        section = t.defaultValue(section, this.area.slice());
        if (iterations === 0) {
            return section;
        }

        let areaCopy = section.slice();
        let width = Math.sqrt(this.area.length);
        for(let c = 0; c < width; c++) {
            for(let r = width-1; r >= 0; r--) {
                let s = areaCopy[r + c*width];
                for(let d in Shared.ALL) {
                    if (s & d) {
                        s += Shared.rotate[d] - +d;
                    }
                }
                section[width - r + c*width] = s;
            }
        }

        return this.rotate(iterations-1, section);
    }
}

module.exports = Board;