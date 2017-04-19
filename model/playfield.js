'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

class PlayField {
    constructor(containerElementId) {
        let canvasCreate = function(id, zIndex) {
            let canvas = document.createElement('CANVAS');
            canvas.id = id;
            canvas.style = 'z-index: '+zIndex+';';
            canvas.setAttribute('class', 'cnvs');
            canvas.setAttribute('width', 1280);
            canvas.setAttribute('height', 720);
            canvas.oncontextmenu = 'return false;';
            return canvas;
        };
        let container = document.getElementById(containerElementId);
        this.canvasFore = canvasCreate(containerElementId + '_foreCanvas', 2);
        this.canvasBack = canvasCreate(containerElementId + '_backCanvas', 1);
        container.appendChild(this.canvasFore);
        container.appendChild(this.canvasBack);
        this.canvasFore.tabIndex = 0;
        this.canvasFore.focus();
        this.ctxFore = this.canvasFore.getContext('2d');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.canvasWidth = this.canvasFore.width;
        this.canvasHeight = this.canvasFore.height;
        this.gameInstances = [];
        this.gameWidth = 1;
        this.gameHeight = 1;
        this.gameBorder = 10;
        this.cellSpace = null;
        this.mouseX = null;
        this.mouseY = null;
        this.fps = {
            frames: 60,
            deltas: [],
            sum: 0
        };

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

    init() {
        let cellSpaceX = (this.canvasFore.width / this.gameWidth - this.gameBorder * 2) / 16,
            cellSpaceY = (this.canvasFore.height / this.gameWidth - this.gameBorder * 2) / 16;
        this.cellSpace = Math.max(Math.min(cellSpaceX, cellSpaceY), 1);
        let g = new GameLogic(
            this.ctxBack,
            this.gameBorder,
            this.gameBorder,
            this.cellSpace,
            this.gameBorder);
        this.gameInstances.push(g);
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

        this.fps.deltas.unshift(delta);
        if (this.fps.deltas.length > this.fps.frames) {
            this.fps.deltas.pop();
        }
        this.fps.sum = this.fps.deltas.reduce(function(a, b) { return a + b; });
    }

    display() {
        this.ctxFore.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].display(this.ctxFore);
        }
    }
}

module.exports = PlayField;