'use strict';

let walls = {
    N: 0b1,
    E: 0b10,
    S: 0b100,
    W: 0b1000
};

walls.reverse = {};
walls.reverse[walls.N] = walls.S;
walls.reverse[walls.E] = walls.W;
walls.reverse[walls.S] = walls.N;
walls.reverse[walls.W] = walls.E;

walls.rotate = {};
walls.rotate[walls.N] = walls.E;
walls.rotate[walls.E] = walls.S;
walls.rotate[walls.S] = walls.W;
walls.rotate[walls.W] = walls.N;

walls.ALL = [
    walls.W,
    walls.S,
    walls.E,
    walls.N
];

walls.xDelta = {};
walls.xDelta[walls.N] = 0;
walls.xDelta[walls.E] = 1;
walls.xDelta[walls.S] = 0;
walls.xDelta[walls.W] = -1;

walls.yDelta = {};
walls.yDelta[walls.N] = -16;
walls.yDelta[walls.E] = 0;
walls.yDelta[walls.S] = 16;
walls.yDelta[walls.W] = 0;


module.exports = walls;