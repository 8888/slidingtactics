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

    generate(callback) {
        let that = this;
        let seedGet = this.provider.promise_post('puzzle.php?action=get', 'r='+(+this.isRanked));
        seedGet.then(callback)
        .catch((e) => {
            console.log(e);
            that.fallback.generate(callback);
        });
    }
}

module.exports = SeedGeneratorDatabase;