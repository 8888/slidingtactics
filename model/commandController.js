'use strict';

let GameEntity = require('../model/gameEntity.js'),
    Direction = require('../model/direction.js');

class CommandController extends GameEntity {
    constructor(x, y, playfield) {
        super(x, y);
        this.playfield = playfield;
        this.enabled = true;
        this.commandCountTotal = 0;
        this.commandsCountMax = 20;
        this.commandDetla = 0;
        this.commandDelay = 30;
        this.commandDelayTemplate = [[200, 'Norm'], [30, 'Fast'], [0, 'MAX']];
        this.devSelect2Text = {0: '2673', 1: '2674', 2: '2675', 3: '2676'};
    }

    init() {
        this.commandCountTotal = 0;
        this.commands = [];
        this.width = this.commandsCountMax * 48;
    }

    displayOnce(ctx) {
        let cl = this.commandDelayTemplate.length;
        for(let i = 0; i < cl; i++) {
            let t = this.commandDelayTemplate[i];
            ctx.fillText(t[1], this.x + 50 * (i + 0.2), this.y - 4);
            ctx.strokeRect(this.x + 50 * i, this.y - 24, 50, 24);
        }
    }

    eventListenersAttach() {
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        window.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                let l = that.commandDelayTemplate.length;
                let y = event.layerY,
                    x = Math.floor(event.layerX / 50);
                if (y > that.y - 24 && y < that.y && x >= 0 && x < l) {
                    that.commandDelay = that.commandDelayTemplate[x][0];
                }
                
            }
        });
    }

    update(delta) {
        this.commandDetla += delta;
        if (this.commandDetla > this.commandDelay && this.enabled) {
            this.commandDetla = 0;
            let c = null;
            if (Math.random() < 0.85 && this.commands.length) {
                c = Direction.ALL[Math.floor(Math.random() * Direction.ALL.length)];
                this.commands.push(Direction.unicode[c]);
                for(let i = 0; i < this.playfield.gameInstances.length; i++) {
                    this.playfield.gameInstances[i].onDevDirection(c);
                }

                if(this.commandDelay === 0) {
                    c = Math.floor(Math.random() * 4);
                    this.commands.push(this.devSelect2Text[c]);
                    for(let i = 0; i < this.playfield.gameInstances.length; i++) {
                        this.playfield.gameInstances[i].onDevSelect(c);
                    }
                    this.commandCountTotal += 1;
                    if (this.commands.length > this.commandsCountMax) {
                        this.commands.shift();
                    }
                }
            } else {
                c = Math.floor(Math.random() * 4);
                this.commands.push(this.devSelect2Text[c]);
                for(let i = 0; i < this.playfield.gameInstances.length; i++) {
                    this.playfield.gameInstances[i].onDevSelect(c);
                }
            }

            this.commandCountTotal += 1;
            if (this.commands.length > this.commandsCountMax) {
                this.commands.shift();
            }
        }
    }

    display(ctx) {
        if (this.commands.length) {
            ctx.fillStyle = 'rgba(112,128,144,0.4)';
            ctx.clearRect(this.x, this.y, this.width, 48);
            ctx.fillRect(this.x, this.y, this.width, 48);
            ctx.strokeRect(this.x, this.y, this.width, 48);
            ctx.font = "48px sans-serif";
            for(let i = 0, l = this.commands.length; i < l; i++) {
                let c = this.commands[i];
                ctx.fillStyle = i == l - 1 ? 'red' : 'black';
                ctx.fillText(String.fromCharCode(parseInt(c, 16)), 48 * (l - i -1) + 8, this.y + 48 - 8);
            }
        }
    }
}

module.exports = CommandController;