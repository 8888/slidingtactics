'use strict';

let t = require('../model/testUtility.js'),
    Shared = require('../model/direction.js');

class Board {
    constructor(key, name, type) {
        /*  name: string - id for this section(s)
            type: string - edition this board is from
        */
        t.assertIntegerGreaterThanZero(key);
        t.assertString(name);
        t.assertString(type);

        this.key = key;
        this.name = name;
        this.type = type;
        this.area = [];
        this.goals = [];
    }

    item(index) {
        return this.area[index];
    }

    rotate(iterations, section, goals) {
        iterations = t.defaultValue(iterations, 1);
        t.assertIntegerPositive(iterations);
        section = t.defaultValue(section, this.area.slice());
        goals = t.defaultValue(goals, this.goals.slice());
        if (iterations === 0) {
            return [section, goals];
        }

        let areaCopy = section.slice();
        let width = Math.sqrt(this.area.length);
        for(let c = 0; c < width; c++) {
            for(let r = width-1; r >= 0; r--) {
                let s = areaCopy[c + r*width];
                let s2 = 0;
                for(let i = 0; i < Shared.ALL.length; i++) {
                    let d = Shared.ALL[i];
                    if (s & d) {
                        s2 += Shared.rotate[d];
                    }
                }
                section[width - 1 - r + c*width] = s2;
            }
        }

        let goalsRotated = [];
        for(let i = 0; i < goals.length; i++){
            let g = goals[i];
            let y = g[1],
                x = g[0];
            goalsRotated.push([width-1-y, x]);
        }

        return this.rotate(iterations-1, section, goalsRotated);
    }
}

module.exports = Board;