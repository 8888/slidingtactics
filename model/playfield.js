'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js'),
    SeedGenerator = require('../model/seedGeneratorDatabase.js');

class PlayField {
    constructor(containerElementId) {
        this.container = document.getElementById(containerElementId);
        this.canvasWidth = 1280;
        this.canvasHeight = 720;
        this.canvasSprite = this.canvasCreate('spriteCanvas', 0, true);
        this.canvasBack = this.canvasCreate('backCanvas', 1, false, 'Lavender');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.canvasAnimation = this.canvasCreate('effectCanvas', 2);
        this.ctxVFX = this.canvasAnimation.getContext('2d');
        this.canvasActors = this.canvasCreate('pieceCanvas', 3);
        this.ctxFore = this.canvasActors.getContext('2d');
        this.gameInstances = [];
        this.games = {
            width: 1,
            height: 1,
            border: 10,
            cellSpace: null,
            deltaTotal: 0,
            countTotal: 0,
            countSolved: 0,
            countMoves: 0
        };

        this.seedGenerator = new SeedGenerator();
    }

    canvasCreate(id, zIndex, isHidden, backgroundColor) {
        let canvas = document.createElement('CANVAS');
        canvas.id = this.container.id + '_' + id;
        canvas.style = 'z-index: '+zIndex+';';
        canvas.setAttribute('class', 'cnvs');
        canvas.setAttribute('width', this.canvasWidth);
        canvas.setAttribute('height', this.canvasHeight);
        canvas.oncontextmenu = 'return false;';
        if (isHidden) {
            canvas.style.display = 'none';
        }
        if (backgroundColor) {
            canvas.style.background = backgroundColor;
        }
        
        this.container.appendChild(canvas);
        return canvas;
    }

    play() {
        let that = this;
        window.onload = function() {
            that.init();
            that.eventListenersAttach();
            var mainloop_updateLast = performance.now();
            (function mainLoop(nowTime) {
                that.update(nowTime - mainloop_updateLast);
                that.display();
                mainloop_updateLast = nowTime;
                requestAnimationFrame(mainLoop);
            })(performance.now());
        };
    }

    init(onGameNewCallback, onGameOverCallback) {
        let that = this;
        onGameOverCallback || (onGameOverCallback = function(g) {
            that.games.countSolved++;
            that.games.countMoves += g.moveCount;
            if (that.games.countSolved == 5) {
                localStorage.setItem("sessionLast_solved", that.games.countSolved);
                localStorage.setItem("sessionLast_moves", that.games.countMoves);
                window.location = 'index.html';
            }
        });
        this.gameInstances = [];
        this.games.border = this.games.width * this.games.height > 500 ? 2 : 10;
        let cellSpaceX = (this.canvasWidth / this.games.width - this.games.border * 2) / 16,
            cellSpaceY = (this.canvasHeight / this.games.height - this.games.border * 2) / 16;
        this.games.cellSpace = Math.floor(Math.max(Math.min(cellSpaceX, cellSpaceY), 1));
        this.games.deltaTotal = 0;
        this.games.countTotal = 0;
        this.games.countSolved = 0;
        this.games.countMoves = 0;
        this.ctxFore.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxVFX.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxBack.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.createSprites(this.canvasSprite.getContext('2d'));
        for(let x = 0; x < this.games.width; x++) {
            for(let y = 0; y < this.games.height; y++) {
                let g = new GameLogic(
                    this.ctxBack, this.ctxFore, this.ctxVFX,
                    this.canvasSprite, this.seedGenerator,
                    (this.games.border + this.games.cellSpace * 16) * x + this.games.border,
                    this.games.border + (this.games.border + this.games.cellSpace * 16) * y,
                    this.games.cellSpace, this.games.border,
                    onGameNewCallback, onGameOverCallback);
                this.gameInstances.push(g);
            }
        }
    }

    eventListenersAttach() {
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        window.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Down(event.layerX, event.layerY);
                }
            }
        });

        window.addEventListener("mouseup", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Up(event.layerX, event.layerY);
                }
            }
        });

        window.addEventListener("keydown", function(event) {
            let direction = Direction.byEventKey[event.key];
            if (direction) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDirection(direction);
                }
            }
        });
    }

    update(delta) {
        this.games.deltaTotal += delta;
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].update(delta);
        }
    }

    display() {
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].display();
        }
    }

    createSprites(ctx) {
        let s = this.games.cellSpace,
            r = s*0.9;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let color = i < 2 ? '#ff0000' : '#0000ff';
            let x = s / 2,
                y = (s * i) + (s / 2);
            let gradient = ctx.createRadialGradient(x+s/5,y-s/5,0, x,y, this.games.cellSpace);
            gradient.addColorStop(0,"white");
            gradient.addColorStop(0.8, color);
            gradient.addColorStop(0.98, color);
            gradient.addColorStop(1,"white");
            ctx.fillStyle = gradient;
            ctx.arc(x, y, s * 0.46, 0, 2 * Math.PI);
            ctx.fill();
            if (i == 1 || i == 3) {
                ctx.beginPath();
                ctx.lineWidth = s * 0.1;
                ctx.strokeStyle = '#ffff00';
                ctx.arc(
                    s / 2,
                    (s * i) + (s / 2),
                    s / 2 - ctx.lineWidth / 2, 0, 2 * Math.PI
                );
                ctx.stroke();
            }
        }

        // possible moves
        ctx.beginPath();
        ctx.lineWidth = s * 0.1;
        ctx.strokeStyle = '#ffff00';
        ctx.arc(
            s / 2,
            (s * 4) + (s / 2),
            this.games.cellSpace / 2 - ctx.lineWidth / 2, 0, 2 * Math.PI
        );
        ctx.stroke();

        // goal
        ctx.fillStyle = '#f442f1';
        ctx.fillRect(
            s * 0.1,
            (s * 0.1) + (s * 5),
            s * 0.8,
            s * 0.8
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(
                s / 2, s / 2 + s * 5,
                (s*0.46)/5 * (i+1), 0, Math.PI * 2, true);
            ctx.fill();
        }
    }
}

module.exports = PlayField;