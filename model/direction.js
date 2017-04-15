'use strict';

let direction = {
    N: 0b1,
    E: 0b10,
    S: 0b100,
    W: 0b1000
};

direction.reverse = {};
direction.reverse[direction.N] = direction.S;
direction.reverse[direction.E] = direction.W;
direction.reverse[direction.S] = direction.N;
direction.reverse[direction.W] = direction.E;

direction.rotate = {};
direction.rotate[direction.N] = direction.E;
direction.rotate[direction.E] = direction.S;
direction.rotate[direction.S] = direction.W;
direction.rotate[direction.W] = direction.N;

direction.ALL = [
    direction.W,
    direction.S,
    direction.E,
    direction.N
];

direction.delta = {};
direction.delta[direction.N] = -16;
direction.delta[direction.E] = 1;
direction.delta[direction.S] = 16;
direction.delta[direction.W] = -1;

direction.unicode = {};
direction.unicode[direction.N] = '261D';
direction.unicode[direction.E] = '261E';
direction.unicode[direction.S] = '261F';
direction.unicode[direction.W] = '261C';

module.exports = direction;