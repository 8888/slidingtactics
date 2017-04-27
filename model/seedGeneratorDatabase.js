'use strict';

let SeedGenerator = require('../model/seedGenerator.js'),
    SeedGeneratorLocal = require('../model/seedGeneratorLocal.js'),
    AJAX = require('../model/ajax.js');

class SeedGeneratorDatabase extends SeedGenerator {
    constructor() {
        super();
        this.provider = AJAX;
        this.fallback = new SeedGeneratorLocal();
        this.seed = null;
    }

    generate() {
        let that = this;
        let seedGet = this.provider.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=get', '');
        seedGet.then((s) => {
            that.seed = s;
        })
        .catch((e) => {
            console.log(e);
            that.fallback.generate();
            that.seed = that.fallback.seed;
        });
    }
}

module.exports = SeedGeneratorDatabase;