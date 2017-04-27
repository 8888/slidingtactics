'use strict';

let GameEntity = require('../model/gameEntity.js');

class FPS extends GameEntity {
    constructor(x, y) {
        super(x, y);
        this.fpsTextDelta = null;
        this.fpsTextSum = null;
        this.fpsReduce = (a, b) => { return a + b; };
    }

    init() {
        this.fps = {
            frames: 60,
            deltas: [],
            sum: 0
        };
    }

    update(delta) {
        this.fps.deltas.unshift(delta);
        if (this.fps.deltas.length > this.fps.frames) {
            this.fps.deltas.pop();
        }
        this.fps.sum = this.fps.deltas.reduce(this.fpsReduce);
    }

    display(ctx) {
        let deltaText = this.fps.deltas[0], sumText = this.fps.sum;
        if (deltaText != this.fpsTextDelta || sumText != this.fpsTextSum) {
            ctx.fillStyle = 'rgba(112,128,144,0.4)';
            ctx.clearRect(this.x, this.y, 200, 48);
            ctx.fillRect(this.x, this.y, 200, 48);
            ctx.strokeRect(this.x, this.y, 200, 48);
            this.fpsTextDelta = deltaText;
            this.fpsTextSum = sumText;
            let fpsText = this.fpsTextDelta.toFixed(2).toString() + "ms " + (1000/(this.fpsTextSum/this.fps.frames)).toFixed(0) + "fps";
            ctx.font = "24px sans-serif";
            ctx.fillStyle = 'red';
            ctx.fillText(fpsText, this.x + 5, this.y + 36);
        }
    }
}

module.exports = FPS;