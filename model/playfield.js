'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

class PlayField {
    constructor(containerElementId) {
        let container = document.getElementById(containerElementId);
        this.canvasFore = this.canvasCreate(containerElementId + '_foreCanvas', 2);
        this.canvasBack = this.canvasCreate(containerElementId + '_backCanvas', 1);
        container.appendChild(this.canvasFore);
        container.appendChild(this.canvasBack);
        this.canvasFore.tabIndex = 0;
        this.canvasFore.focus();
        this.canvasBack.style.background = 'Lavender';
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

    init() {
        let cellSpaceX = (this.canvasFore.width / this.gameWidth - this.gameBorder * 2) / 16,
            cellSpaceY = (this.canvasFore.height / this.gameHeight - this.gameBorder * 2) / 16;
        this.cellSpace = Math.max(Math.min(cellSpaceX, cellSpaceY), 1);
        this.gameInstances = [];
        this.ctxFore.clearRect(0, 0, this.canvasFore.width, this.canvasFore.height);
        this.ctxBack.clearRect(0, 0, this.canvasBack.width, this.canvasBack.height);
        for(let x = 0; x < this.gameWidth; x++) {
            for(let y = 0; y < this.gameHeight; y++) {
                let g = new GameLogic(
                    this.ctxBack,
                    (this.gameBorder + this.cellSpace * 16) * x + this.gameBorder,
                    this.gameBorder + (this.gameBorder + this.cellSpace * 16) * y,
                    this.cellSpace,
                    this.gameBorder);
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
}

module.exports = PlayField;