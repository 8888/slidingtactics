'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js'),
    SeedGenerator = require('../model/seedGeneratorDatabase.js');

class PlayField {
    constructor(containerElementId) {
        let container = document.getElementById(containerElementId);
        this.canvasActors = this.canvasCreate(containerElementId + '_pieceCanvas', 3);
        this.canvasAnimation = this.canvasCreate(containerElementId + '_effectCanvas', 2);
        this.canvasBack = this.canvasCreate(containerElementId + '_backCanvas', 1);
        this.canvasSprite = this.canvasCreate(containerElementId + '_spriteCanvas', 0);
        container.appendChild(this.canvasActors);
        container.appendChild(this.canvasAnimation);
        container.appendChild(this.canvasBack);
        container.appendChild(this.canvasSprite);
        this.canvasActors.tabIndex = 0;
        this.canvasActors.focus();
        this.canvasBack.style.background = 'Lavender';
        this.canvasSprite.style.display = 'none';
        this.ctxFore = this.canvasActors.getContext('2d');
        this.ctxVFX = this.canvasAnimation.getContext('2d');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.ctxSprite = this.canvasSprite.getContext('2d');
        this.canvasWidth = this.canvasActors.width;
        this.canvasHeight = this.canvasActors.height;
        this.seedGenerator = null;
        this.gameInstances = [];
        this.gameWidth = 1;
        this.gameHeight = 1;
        this.gameBorder = 10;
        this.cellSpace = null;
        this.mouseX = null;
        this.mouseY = null;
        this.playfieldDeltaTime = 0;
        this.gamesCountTotal = 0;
        this.gamesSolvedCountTotal = 0;
        this.moveCountTotal = 0;
        this.seedGenerator = new SeedGenerator();
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
        onGameOverCallback || (onGameOverCallback = function(g) {
            that.gamesSolvedCountTotal++;
            that.moveCountTotal += g.moveCount;
            if (that.gamesSolvedCountTotal == 5) {
                localStorage.setItem("sessionLast_solved", that.gamesSolvedCountTotal);
                localStorage.setItem("sessionLast_moves", that.moveCountTotal);
                window.location = 'index.html';
            }
        });
        this.gameBorder = this.gameWidth * this.gameHeight > 500 ? 2 : 10;
        let cellSpaceX = (this.canvasWidth / this.gameWidth - this.gameBorder * 2) / 16,
            cellSpaceY = (this.canvasHeight / this.gameHeight - this.gameBorder * 2) / 16;
        this.cellSpace = Math.floor(Math.max(Math.min(cellSpaceX, cellSpaceY), 1));
        this.playfieldDeltaTime = 0;
        this.gameInstances = [];
        this.gamesCountTotal = 0;
        this.gamesSolvedCountTotal = 0;
        this.moveCountTotal = 0;
        this.ctxFore.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxVFX.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxBack.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.createSprites(this.ctxSprite);
        for(let x = 0; x < this.gameWidth; x++) {
            for(let y = 0; y < this.gameHeight; y++) {
                let g = new GameLogic(
                    this.ctxBack, this.ctxFore, this.ctxVFX,
                    this.canvasSprite, this.seedGenerator,
                    (this.gameBorder + this.cellSpace * 16) * x + this.gameBorder,
                    this.gameBorder + (this.gameBorder + this.cellSpace * 16) * y,
                    this.cellSpace, this.gameBorder,
                    onGameNewCallback, onGameOverCallback);
                this.gameInstances.push(g);
            }
        }
    }

    eventListenersAttach() {
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        this.canvasActors.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Down(that.mouseX, that.mouseY);
                }
            }
        });

        this.canvasActors.addEventListener("mousemove", function(event) {
            that.mouseX = event.layerX;
            that.mouseY = event.layerY;
        });

        this.canvasActors.addEventListener("mouseup", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Up(that.mouseX, that.mouseY);
                }
            }
        });

        this.canvasActors.addEventListener("keydown", function(event) {
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
        this.playfieldDeltaTime += delta;
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
        this.canvasSprite.setAttribute('width', this.cellSpace);
        this.canvasSprite.setAttribute('height', this.cellSpace * 6);
        // red, red selected, blue, blue selected
        let s = this.cellSpace,
            r = s*0.9;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let color = i < 2 ? '#ff0000' : '#0000ff';
            let x = this.cellSpace / 2,
                y = (this.cellSpace * i) + (this.cellSpace / 2);
            let gradient = ctx.createRadialGradient(x+this.cellSpace/5,y-this.cellSpace/5,0, x,y, this.cellSpace);
            gradient.addColorStop(0,"white");
            gradient.addColorStop(0.8, color);
            gradient.addColorStop(0.98, color);
            gradient.addColorStop(1,"white");
            ctx.fillStyle = gradient;
            ctx.arc(
                x,
                y,
                this.cellSpace * 0.46, 0, 2 * Math.PI
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
        ctx.fillRect(
            this.cellSpace * 0.1,
            (this.cellSpace * 0.1) + (this.cellSpace * 5),
            this.cellSpace * 0.8,
            this.cellSpace * 0.8
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(
                this.cellSpace / 2, this.cellSpace / 2 + this.cellSpace * 5,
                (this.cellSpace*0.46)/5 * (i+1), 0, Math.PI * 2, true);
            ctx.fill();
        }
    }
}

module.exports = PlayField;