'use strict';
let chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon');

let BoardGenerator = require('../model/boardGenerator.js');

describe('boardGenerator.constructor', function() {
    it('', function() {
        let bgTest = new BoardGenerator();
        bgTest.generate();
    });
});