'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

class PlayField {
    constructor(containerElementId) {
        let container = document.getElementById(containerElementId);
        this.canvasFore = this.canvasCreate(containerElementId + '_foreCanvas', 2);
        this.canvasBack = this.canvasCreate(containerElementId + '_backCanvas', 1);
        this.canvasSprite = this.canvasCreate(containerElementId + '_spriteCanvas', 3);
        container.appendChild(this.canvasFore);
        container.appendChild(this.canvasBack);
        container.appendChild(this.canvasSprite);
        this.canvasFore.tabIndex = 0;
        this.canvasFore.focus();
        this.canvasBack.style.background = 'Lavender';
        this.canvasSprite.style.display = 'none';
        this.ctxFore = this.canvasFore.getContext('2d');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.ctxSprite = this.canvasSprite.getContext('2d');
        this.canvasWidth = this.canvasFore.width;
        this.canvasHeight = this.canvasFore.height;
        this.gameInstances = [];
        this.gameWidth = 1;
        this.gameHeight = 1;
        this.gameBorder = 10;
        this.cellSpace = null;
        this.mouseX = null;
        this.mouseY = null;
        this.moveCount = 0;
        this.puzzlesSolved = 0;
    }

    canvasCreate(id, zIndex) {
        let canvas = document.createElement('CANVAS');
        canvas.id = id;
        canvas.style = 'z-index: '+zIndex+';';
        canvas.setAttribute('class', 'cnvs');
        canvas.setAttribute('width', 1280);
        canvas.setAttribute('height', 720);
        canvas.oncontextmenu = 'return false;';
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
        onGameOverCallback || ( onGameOverCallback = function(g) {
            that.puzzlesSolved++;
            that.moveCount += g.moveCount;
            if (that.puzzlesSolved == 5) {
                localStorage.setItem("sessionLast_solved", that.puzzlesSolved);
                localStorage.setItem("sessionLast_moves", that.moveCount);
                window.location = 'index.html';
            }
        });
        let cellSpaceX = (this.canvasFore.width / this.gameWidth - this.gameBorder * 2) / 16,
            cellSpaceY = (this.canvasFore.height / this.gameHeight - this.gameBorder * 2) / 16;
        this.cellSpace = Math.max(Math.min(cellSpaceX, cellSpaceY), 1);
        this.gameInstances = [];
        this.ctxFore.clearRect(0, 0, this.canvasFore.width, this.canvasFore.height);
        this.ctxBack.clearRect(0, 0, this.canvasBack.width, this.canvasBack.height);
        this.createSprites(this.ctxSprite);
        for(let x = 0; x < this.gameWidth; x++) {
            for(let y = 0; y < this.gameHeight; y++) {
                let g = new GameLogic(
                    this.ctxBack,
                    this.canvasSprite,
                    (this.gameBorder + this.cellSpace * 16) * x + this.gameBorder,
                    this.gameBorder + (this.gameBorder + this.cellSpace * 16) * y,
                    this.cellSpace,
                    this.gameBorder,
                    onGameNewCallback, onGameOverCallback);
                this.gameInstances.push(g);
            }
        }
    }

    eventListenersAttach() {
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        this.canvasFore.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Down(that.mouseX, that.mouseY);
                }
            }
        });

        this.canvasFore.addEventListener("mousemove", function(event) {
            that.mouseX = event.layerX;
            that.mouseY = event.layerY;
        });

        this.canvasFore.addEventListener("mouseup", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Up(that.mouseX, that.mouseY);
                }
            }
        });

        this.canvasFore.addEventListener("keydown", function(event) {
            let direction = null;
            if (event.key === "ArrowLeft") {
                direction = Direction.W;
            } else if (event.key === "ArrowUp") {
                direction = Direction.N;
            } else if (event.key === "ArrowRight") {
                direction = Direction.E;
            } else if (event.key === "ArrowDown") {
                direction = Direction.S;
            }

            if (direction) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDirection(direction);
                }
            }
        });
    }

    update(delta) {
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].update(delta);
        }
    }

    display() {
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].display(this.ctxFore);
        }
    }

    createSprites(ctx) {
        this.canvasSprite.setAttribute('width', this.cellSpace);
        this.canvasSprite.setAttribute('height', this.cellSpace * 6);
        // red, red selected, blue, blue selected
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.fillStyle = i < 2 ? '#ff0000' : '#0000ff';
            ctx.arc(
                this.cellSpace / 2,
                (this.cellSpace * i) + (this.cellSpace / 2),
                this.cellSpace / 2, 0, 2 * Math.PI
            );
            ctx.fill();
            if (i == 1 || i == 3) {
                ctx.beginPath();
                ctx.lineWidth = this.cellSpace * 0.1;
                ctx.strokeStyle = '#ffff00';
                ctx.arc(
                    this.cellSpace / 2,
                    (this.cellSpace * i) + (this.cellSpace / 2),
                    this.cellSpace / 2 - ctx.lineWidth / 2, 0, 2 * Math.PI
                );
                ctx.stroke();
            }
        }
        // possible moves
        ctx.beginPath();
        ctx.lineWidth = this.cellSpace * 0.1;
        ctx.strokeStyle = '#ffff00';
        ctx.arc(
            this.cellSpace / 2,
            (this.cellSpace * 4) + (this.cellSpace / 2),
            this.cellSpace / 2 - ctx.lineWidth / 2, 0, 2 * Math.PI
        );
        ctx.stroke();
        // goal
        ctx.fillStyle = '#f442f1';
        ctx.fillRect(this.cellSpace * 0.1, (this.cellSpace * 0.1) + (this.cellSpace * 5), this.cellSpace * 0.8, this.cellSpace * 0.8);
    }
}

module.exports = PlayField;