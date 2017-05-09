'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js'),
    View = require('../model/view.js'),
    SeedGenerator = require('../model/seedGeneratorDatabase.js'),
    SeedGeneratorGuest = require('../model/seedGeneratorLocal.js'),
    AJAX = require('../model/ajax.js');

class PlayField {
    constructor(containerElementId, is_guest) {
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
        this.boardSize = 16;
        this.is_guest = parseInt(is_guest);
        this.seedGenerator = this.is_guest ? new SeedGeneratorGuest() : new SeedGenerator();
        this.view = View;
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

    init(onGameNewCallback, onGameOverCallback, onMoveCallback) {
        let that = this;
        onGameOverCallback || (onGameOverCallback = function(g) {
            that.games.countSolved++;
            that.games.countMoves += g.moveCount;
            if(!that.is_guest) {
                let puzzleUpdate = AJAX.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=update',
                    'key='+g.puzzle_instance_key+'&s=1&m='+g.moveCount);
            }
            if (that.games.countSolved == 5) {
                localStorage.setItem("sessionLast_solved", that.games.countSolved);
                localStorage.setItem("sessionLast_moves", that.games.countMoves);
                window.location = 'index.html';
            }
        });
        onMoveCallback || (onMoveCallback = function(key, move, piece, direction, start, end) {
            if (!that.is_guest) {
                let moveUpdate = AJAX.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=addMove',
                    'key='+key+'&m='+move+'&p='+piece+'&d='+direction+'&s='+start+'&e='+end);
            }
        });
        this.gameInstances = [];
        this.games.border = this.games.width * this.games.height > 500 ? 2 : 10;
        let cellSpaceX = (this.canvasWidth / this.games.width - this.games.border * 2) / this.boardSize,
            cellSpaceY = (this.canvasHeight / this.games.height - this.games.border * 2) / this.boardSize;
        this.games.cellSpace = Math.floor(Math.max(Math.min(cellSpaceX, cellSpaceY), 1));
        this.games.deltaTotal = 0;
        this.games.countTotal = 0;
        this.games.countSolved = 0;
        this.games.countMoves = 0;
        this.ctxFore.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxVFX.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxBack.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        let ctxSprite = this.canvasSprite.getContext('2d');
        ctxSprite.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.createSprites(ctxSprite);
        for(let w = 0; w < this.games.width; w++) {
            for(let h = 0; h < this.games.height; h++) {
                let x = (this.games.border + this.games.cellSpace * this.boardSize) * w + this.games.border,
                    y = this.games.border + (this.games.border + this.games.cellSpace * this.boardSize) * h;
                let v = this.view ? new this.view(
                    this.ctxBack, this.ctxFore, this.ctxVFX, this.canvasSprite,
                    x, y, this.games.cellSpace, this.games.border, this.boardSize)
                    : null;
                let g = new GameLogic(
                    v, this.seedGenerator,
                    x, y, this.games.cellSpace, this.boardSize,
                    onGameNewCallback, onGameOverCallback, onMoveCallback);
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
            } else {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onKeyDown(event.key);
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