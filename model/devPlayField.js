'use strict';

let PlayField = require('../model/playfield.js'),
    Direction = require('../model/direction.js'),
    SeedGenerator = require('../model/seedGeneratorLocal.js'),
    FPS = require('../model/devFPS.js');

class DevPlayField extends PlayField {

    constructor(containerElementId, x, y) {
        super(containerElementId);
        this.seedGenerator = new SeedGenerator();
        this.fps = new FPS(this.canvasWidth - 200, this.canvasHeight - 48);
        this.games.width = x;
        this.games.height = y;

        this.canvasDebu = super.canvasCreate('debuCavnas', 3, true);
        this.ctxDebu = this.canvasDebu.getContext('2d');

        this.devAutoCommandEnabled = true;
        this.commandCountTotal = 0;
        this.commandsCountMax = 20;
        this.commandDetla = 0;
        this.commandDelay = 30;
        this.devSelect2Text = {0: '2673', 1: '2674', 2: '2675', 3: '2676'};
        this.commandDelayTemplate = [[200, 'Norm'], [30, 'Fast'], [0, 'MAX']];
        this.gameInstanceTemplate = [
            [1, 1, '01x01=0001'],
            [2, 1, '02x01=0002'],
            [4, 2, '04x02=0008'],
            [7, 3, '07x03=0021'],
            [18, 10, '18x10=0180'],
            [24, 13, '24x13=0312'],
            [50, 25, '50x25=1250'],
            [70, 39, '70x39=2730']
        ];
        let that = this;
        this.statistics = [
            ["Time", function() {return parseInt(that.playfieldDeltaTime / 1000); }],
            ["Game", function() {return that.games.countTotal; }],
            ["Wins", function() {return that.games.countSolved; }],
            ["Cmds", function() {return that.commandCountTotal; }],
            ["C/S", function() {return parseInt(that.commandCountTotal/(that.playfieldDeltaTime/1000)); }],
            ["Move", function() {return that.games.countMoves; }],
            ["Move/Win", function() {return parseInt(that.games.countMoves/that.games.countSolved); }],
            ["Win/S", function() {return parseInt(that.games.countSolved/(that.playfieldDeltaTime/1000)); }]
        ];
    }

    init() {
        let that = this;
        super.init(function(g) { that.gameNewCallback(g); }, function(g) { that.gameOverCallback(g); });
        this.fps.init();
        this.commandCountTotal = 0;
        this.commands = [];
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
        this.games.countTotal++;
    }

    gameOverCallback(g) {
        this.games.countSolved++;
        this.games.countMoves += g.moveCount;
        this.ctxFore.clearRect(g.x, g.y, this.games.cellSpace * 16, this.games.cellSpace * 16);
        this.ctxVFX.clearRect(g.x, g.y, this.games.cellSpace * 16, this.games.cellSpace * 16);
        this.ctxBack.clearRect(g.x, g.y, this.games.cellSpace * 16, this.games.cellSpace * 16);
        g.newGame();
    }

    eventListenersAttach() {
        super.eventListenersAttach();
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        window.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                let l = that.gameInstanceTemplate.length + that.commandDelayTemplate.length;
                let y = Math.floor((event.layerY - (that.canvasHeight - 48 - 24 * l)) / 24),
                    x = event.layerX;
                if (x > that.canvasWidth - 100 && x < that.canvasWidth) {
                    if (y < 0) {
                    } else if (y < that.commandDelayTemplate.length) {
                        that.commandDelay = that.commandDelayTemplate[y][0];
                    } else if (y < l) {
                        let gi = that.gameInstanceTemplate[y-that.commandDelayTemplate.length];
                        that.games.width = gi[0];
                        that.games.height = gi[1];
                        that.init();
                    }
                }
                
            }
        });

        let keyDownToSelect = { "1": 0, "2": 1, "3": 2, "4": 3 };
        window.addEventListener("keydown", function(event) {
            let devSelect = keyDownToSelect[event.key];
            if (devSelect !== undefined) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDevSelect(devSelect);
                }
            }
        });

        let keyDownToHide = { '`': that.canvasDebu, 'f': that.canvasActors, 'b': that.canvasBack, 'v': that.canvasAnimation };
        let displayToggle = function(e) { let s = e.style.display; e.style.display = s == 'none' ? 'inline' : 'none'; };
        window.addEventListener("keydown", function(event) {
            let element = keyDownToHide[event.key];
            if (element) displayToggle(element);
            if (event.key == "p") that.devAutoCommandEnabled = !that.devAutoCommandEnabled;
        });
    }

    update(delta) {
        super.update(delta);
        this.commandDetla += delta;
        if (this.commandDetla > this.commandDelay && this.devAutoCommandEnabled) {
            this.commandDetla = 0;
            let c = null;
            if (Math.random() < 0.85 && this.commands.length) {
                c = Direction.ALL[Math.floor(Math.random() * Direction.ALL.length)];
                this.commands.push(Direction.unicode[c]);
                for(let i = 0; i < this.gameInstances.length; i++) {
                    this.gameInstances[i].onDevDirection(c);
                }

                if(this.commandDelay === 0) {
                    c = Math.floor(Math.random() * 4);
                    this.commands.push(this.devSelect2Text[c]);
                    for(let i = 0; i < this.gameInstances.length; i++) {
                        this.gameInstances[i].onDevSelect(c);
                    }
                    this.commandCountTotal += 1;
                    if (this.commands.length > this.commandsCountMax) {
                        this.commands.shift();
                    }
                }
            } else {
                c = Math.floor(Math.random() * 4);
                this.commands.push(this.devSelect2Text[c]);
                for(let i = 0; i < this.gameInstances.length; i++) {
                    this.gameInstances[i].onDevSelect(c);
                }
            }

            this.commandCountTotal += 1;
            if (this.commands.length > this.commandsCountMax) {
                this.commands.shift();
            }
        }
        this.fps.update(delta);
    }

    display() {
        super.display();
        if (this.canvasDebu.style.display !== 'none') {
            if (this.commands.length) {
                let l = this.commands.length;
                this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
                this.ctxDebu.clearRect(0, this.canvasHeight - 48, 48 * this.commandsCountMax + this.games.border, 48);
                this.ctxDebu.fillRect(0, this.canvasHeight - 48, 48 * this.commandsCountMax + this.games.border, 48);
                this.ctxDebu.strokeRect(0, this.canvasHeight - 48, 48 * this.commandsCountMax + this.games.border, 48);
                this.ctxDebu.font = "48px sans-serif";
                for(let i = 0; i < l; i++) {
                    let c = this.commands[i];
                    this.ctxDebu.fillStyle = i == l - 1 ? 'red' : 'black';
                    this.ctxDebu.fillText(String.fromCharCode(parseInt(c, 16)), this.games.border + 48 * (l - i -1), this.canvasHeight-8);
                }
            }

            this.displayStatistics();
            this.fps.display(this.ctxDebu);
        }
    }

    displayStatistics() {
        let l = this.statistics.length,
            h = l * 24,
            w = 150;
        this.ctxDebu.lineWidth = 1;
        this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
        this.ctxDebu.clearRect(this.canvasWidth - w, 0, w, h);
        this.ctxDebu.fillRect(this.canvasWidth - w, 0, w, h);
        this.ctxDebu.font = '14px sans-serif';
        this.ctxDebu.fillStyle = 'black';
        for(let i = 0; i < l; i++) {
            let t = this.statistics[i];
            this.ctxDebu.fillText(t[0]+': '+t[1]().toString(), this.canvasWidth - w*0.9, 24 * (i + 0.6));
            this.ctxDebu.strokeRect(this.canvasWidth - w, 24 * i, w, 24);
        }
    }
}

module.exports = DevPlayField;