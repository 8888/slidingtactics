'use strict';

let SeedGenerator = require('../model/seedGenerator.js'),
    BoardGenerator = require('../model/boardGenerator.js');

class SeedGeneratorLocal extends SeedGenerator {
    constructor() {
        super();
        this.provider = new BoardGenerator();
        this.seed = null;
    }

    generate(callback) {
        this.seed = null;
        let boards = [],
            goals = [];
        let boardSectionsLength = this.provider.boardSections.length;
        for(let i = 0; i < 4; i++) {
            let b = this.provider.boardSections[Math.floor(Math.random() * boardSectionsLength)];
            boards.push(b.key);
            goals.push(b.goals);
        }

        let goal = this.provider.generateGoals(...goals)[Math.floor(Math.random() * goals.length)];
        callback({'b': boards, 'g': goal, 'p': this.playersGenerate(goal)});
    }

    playersGenerate(goal) {
        let randboardloc = function(players, goal) {
            let noSpace = players.map(function(p) { return p.location; }).concat(goal).concat([119,120,135,136]);
            let space = null,
                attemptCount = 0,
                attemptCountMax = 20;
            while (space === null && attemptCount < attemptCountMax) {
                attemptCount++;
                let s = Math.floor(Math.random() * 16 * 16);
                if (noSpace.indexOf(s) === -1) {
                    space = s;
                }
            }

            if (space === null) {
                throw new Error('Could not place player!');
            }

            return space;
        };
        let players = [];
        for (let i = 0; i < 4; i++) {
            players.push(randboardloc(players, goal));
        }

        return players;
    }
}

module.exports = SeedGeneratorLocal;