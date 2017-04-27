'use strict';

let SeedGenerator = require('../model/seedGenerator.js'),
    AJAX = require('../model/ajax.js');

class SeedGeneratorDatabase extends SeedGenerator {
    constructor() {
        super();
        this.provider = AJAX;
        this.seed = null;
    }

    generate() {
        let that = this;
        this.provider.post_request('https://tactics.prototypeholdings.com/x/puzzle.php', '', function(s) {
            that.seed = JSON.parse(s);
        });
    }
}

module.exports = SeedGeneratorDatabase;