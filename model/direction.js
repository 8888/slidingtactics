'use strict';

let directions = {
    power: 0,
    ALL: [],
    delta: {},
    byEventKey: {},
    reverse: {},
    rotate: {},
    unicode: {}
};
function directionAdd (direction, reverse, rotate, delta, eventKey, unicode) {
    let d = Math.pow(2, directions.power);
    directions.power++;
    directions[direction] = d;
    directions.ALL.push(d);
    directions.reverse[d] = reverse;
    directions.rotate[d] = rotate;
    directions.delta[d] = delta;
    directions.byEventKey[eventKey] = d;
    directions.unicode[d] = unicode;
}

/* ORDER DETERMINES KEY -- DO NOT REORDER */
directionAdd('N', 0b100, 0b10, -16, 'ArrowUp', '261D');
directionAdd('E', 0b1000, 0b100, 1, 'ArrowRight', '261E');
directionAdd('S', 0b1, 0b1000, 16, 'ArrowDown', '261F');
directionAdd('W', 0b10, 0b1, -1, 'ArrowLeft', '261C');

module.exports = directions;