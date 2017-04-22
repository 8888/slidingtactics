'use strict';

let PlayField = require('../model/playfield.js'),
    Direction = require('../model/direction.js');

class DevPlayField extends PlayField {

    constructor(containerElementId, x, y) {
        super(containerElementId);
        this.gameWidth = x;
        this.gameHeight = y;
        let container = document.getElementById(containerElementId);
        this.canvasDebu = super.canvasCreate(containerElementId+'_debuCavnas', 3);
        this.canvasDebu.style.display = 'none';
        this.ctxDebu = this.canvasDebu.getContext('2d');
        container.appendChild(this.canvasDebu);
        this.devAutoCommandEnabled = true;
        this.fpsTextDelta = null;
        this.fpsTextSum = null;
        this.commandsCountMax = 20;
        this.commandDetla = 0;
        this.commandDelay = 30;
        this.devSelect2Text = {0: '2673', 1: '2674', 2: '2675', 3: '2676'};
        this.commandDelayTemplate = [[600, 'Slow'], [200, 'Norm'], [30, 'Fast']];
        this.gameInstanceTemplate = [
            [1, 1, '01x01=0001'],
            [3, 1, '03x01=0003'],
            [4, 2, '04x02=0008'],
            [7, 3, '07x03=0021'],
            [20, 10, '20x10=0200'],
            [28, 15, '28x15=0420'],
            [50, 25, '50x25=1250'],
            [85, 60, '85x60=5100']
        ];
    }

    init() {
        let that = this;
        super.init(
            function(g) { that.gameNewCallback(g); }, function(g) { that.gameOverCallback(g); });
        this.commands = [];
        this.fps = {
            frames: 60,
            deltas: [],
            sum: 0
        };
        let l = this.gameInstanceTemplate.length,
            cl = this.commandDelayTemplate.length,
            h = 24 * (l+cl);
        this.ctxDebu.lineWidth = 1;
        this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
        this.ctxDebu.clearRect(this.canvasWidth - 100, this.canvasHeight - 48 - h, 100, h);
        this.ctxDebu.fillRect(this.canvasWidth - 100, this.canvasHeight - 48 - h, 100, h);
        this.ctxDebu.font = '14px sans-serif';
        this.ctxDebu.fillStyle = 'black';
        for(let i = 0; i < l; i++) {
            let t = this.gameInstanceTemplate[l-i-1];
            this.ctxDebu.fillText(t[2], this.canvasWidth - 90, this.canvasHeight - 48 - 24 * (i + 0.4));
            this.ctxDebu.strokeRect(this.canvasWidth - 100, this.canvasHeight - 48 - 24 * (i+1), 100, 24);
        }

        for(let i = 0; i < cl; i++) {
            let t = this.commandDelayTemplate[cl-i-1];
            this.ctxDebu.fillText(t[1], this.canvasWidth - 65, this.canvasHeight - 48 - 24 * (l+i + 0.4));
            this.ctxDebu.strokeRect(this.canvasWidth - 100, this.canvasHeight - 48 - 24 * (l+i+1), 100, 24);
        }

        /* Board Names
        this.ctxDebu.fillStyle = 'red';
        this.ctxDebu.font = this.gameBorder + "px sans-serif";
        for(let i = 0; i < this.gameInstances.length; i++) {
            let g = this.gameInstances[i];
            this.ctxDebu.fillText(g.board.name, g.x, g.y-1);
        }*/
    }

    gameNewCallback(gamecore) {
        //console.log("new game", gamecore.board.name);
    }

    gameOverCallback(gamecore) {
        this.puzzlesSolved++;
        this.moveCount += gamecore.moveCount;
        gamecore.newGame();
    }

    eventListenersAttach() {
        super.eventListenersAttach();
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        this.canvasDebu.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                let l = that.gameInstanceTemplate.length + that.commandDelayTemplate.length;
                let y = Math.floor((event.layerY - (that.canvasDebu.height - 48 - 24 * l)) / 24),
                    x = event.layerX;
                if (x > that.canvasWidth - 100 && x < that.canvasWidth) {
                    if (y < 0) {
                    } else if (y < that.commandDelayTemplate.length) {
                        that.commandDelay = that.commandDelayTemplate[y][0];
                    } else if (y < l) {
                        let gi = that.gameInstanceTemplate[y-that.commandDelayTemplate.length];
                        that.gameWidth = gi[0];
                        that.gameHeight = gi[1];
                        that.init();
                    }
                }
                
            }
        });

        this.canvasFore.addEventListener("keydown", function(event) {
            let devSelect = null;
            if (event.key === "1") {
                devSelect = 0;
            } else if (event.key === "2") {
                devSelect = 1;
            } else if (event.key === "3") {
                devSelect = 2;
            } else if (event.key === "4") {
                devSelect = 3;
            }

            if (devSelect !== null) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDevSelect(devSelect);
                }
            }
        });

        window.addEventListener("keydown", function(event) {
            if (event.key == '`') {
                let s = that.canvasDebu.style.display;
                that.canvasDebu.style.display = s == 'none' ? 'inline' : 'none';
            } else if (event.key == 'f') {
                let s = that.canvasFore.style.display;
                that.canvasFore.style.display = s == 'none' ? 'inline' : 'none';
            } else if (event.key == 'b') {
                let s = that.canvasBack.style.display;
                that.canvasBack.style.display = s == 'none' ? 'inline' : 'none';
            } else if (event.key == "p") {
                that.devAutoCommandEnabled = !that.devAutoCommandEnabled;
            }
        });
    }

    update(delta) {
        super.update(delta);
        this.commandDetla += delta;
        if (this.commandDetla > this.commandDelay && this.devAutoCommandEnabled) {
            this.commandDetla = 0;
            let roll = Math.random();
            let c = null;
            if (roll < 0.85 && this.commands.length) {
                c = Direction.ALL[Math.floor(Math.random() * Direction.ALL.length)];
                this.commands.push(Direction.unicode[c]);
                for(let i = 0; i < this.gameInstances.length; i++) {
                    this.gameInstances[i].onDevDirection(c);
                }
            } else {
                c = Math.floor(Math.random() * 4);
                this.commands.push(this.devSelect2Text[c]);
                for(let i = 0; i < this.gameInstances.length; i++) {
                    this.gameInstances[i].onDevSelect(c);
                }
            }

            if (this.commands.length > this.commandsCountMax) {
                this.commands.shift();
            }
        }

        this.fps.deltas.unshift(delta);
        if (this.fps.deltas.length > this.fps.frames) {
            this.fps.deltas.pop();
        }
        this.fps.sum = this.fps.deltas.reduce(function(a, b) { return a + b; });
    }

    display() {
        super.display();
        if (this.canvasDebu.style.display !== 'none') {
            if (this.commands.length) {
                let l = this.commands.length;
                this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
                this.ctxDebu.clearRect(0, this.canvasHeight - 48, 48 * this.commandsCountMax + this.gameBorder, 48);
                this.ctxDebu.fillRect(0, this.canvasHeight - 48, 48 * this.commandsCountMax + this.gameBorder, 48);
                this.ctxDebu.strokeRect(0, this.canvasHeight - 48, 48 * this.commandsCountMax + this.gameBorder, 48);
                this.ctxDebu.font = "48px sans-serif";
                for(let i = 0; i < l; i++) {
                    let c = this.commands[i];
                    this.ctxDebu.fillStyle = i == l - 1 ? 'red' : 'black';
                    this.ctxDebu.fillText(String.fromCharCode(parseInt(c, 16)), this.gameBorder + 48 * (l - i -1), this.canvasHeight-8);
                }
            }

            let deltaText = this.fps.deltas[0], sumText = this.fps.sum;
            if (deltaText != this.fpsTextDelta || sumText != this.fpsTextSum) {
                this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
                this.ctxDebu.clearRect(this.canvasWidth - 200, this.canvasHeight - 48, 200, 48);
                this.ctxDebu.fillRect(this.canvasWidth - 200, this.canvasHeight - 48, 200, 48);
                this.ctxDebu.strokeRect(this.canvasWidth - 200, this.canvasHeight - 48, 200, 48);
                this.fpsTextDelta = deltaText;
                this.fpsTextSum = sumText;
                let fpsText = this.fpsTextDelta.toFixed(2).toString() + "ms " + (1000/(this.fpsTextSum/this.fps.frames)).toFixed(0) + "fps";
                this.ctxDebu.font = "24px sans-serif";
                this.ctxDebu.fillStyle = 'red';
                this.ctxDebu.fillText(fpsText, this.canvasWidth - 195, this.canvasHeight-12);
            }
        }
    }
}

module.exports = DevPlayField;