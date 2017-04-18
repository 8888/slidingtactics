'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

// Canvas Parameters
let canvas = document.getElementById('cnvsForeground');
canvas.tabIndex = 0;
canvas.focus();
let canvasWidth = canvas.width,
    canvasHeight = canvas.height,
    canvasBounds = canvas.getBoundingClientRect(),
    ctx = canvas.getContext('2d'),
    ctxBack = document.getElementById('cnvsBackground').getContext('2d'),
    originX = 50,
    originY = 50;
// Mouse
let mouseX = null,
    mouseY = null;

// Main Constants
let gameInstances = [];
let gamesWidth = null,
    gamesHeight = null,
    gamesBorder = 10,
    cellSpace = null;

function init() {
    ctx.font = "14px Serif";
    gamesWidth = 1;
    gamesHeight = 1;

    let cellSpaceX = (canvasWidth / gamesWidth - gamesBorder * 2) / 16,
        cellSpaceY = (canvasHeight / gamesHeight - gamesBorder * 2) / 16;
    cellSpace = Math.max(Math.min(cellSpaceX, cellSpaceY), 1);

    let g = new GameLogic(
        ctxBack,
        gamesBorder,
        gamesBorder,
        cellSpace,
        gamesBorder);
    gameInstances.push(g);
}

var fps = {
    frames: 60,
    deltas: [],
    sum: 0
};

function update(delta) {
    for(let i = 0; i < gameInstances.length; i++) {
        gameInstances[i].update(delta);
    }

    fps.deltas.unshift(delta);
    if (fps.deltas.length > fps.frames) {
        fps.deltas.pop();
    }
    fps.sum = fps.deltas.reduce(function(a, b) { return a + b; });
}

function display() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for(let i = 0; i < gameInstances.length; i++) {
        gameInstances[i].display(ctx);
    }
}

let LEFT_MOUSE_CLICK = 0;
canvas.addEventListener("mousedown", function(event) {
    if (event.button === LEFT_MOUSE_CLICK) {
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onMouse1Down(mouseX, mouseY);
        }
    }
});

canvas.addEventListener("mousemove", function(event) {
    mouseX = event.layerX;
    mouseY = event.layerY;
});

canvas.addEventListener("mouseup", function(event) {
    if (event.button === LEFT_MOUSE_CLICK) {
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onMouse1Up(mouseX, mouseY);
        }
    }
});

canvas.addEventListener("keydown", function(event) {
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
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onDirection(direction);
        }
    }
});

window.onload = function() {
    init();
    var mainloop_updateLast = performance.now();
    (function mainLoop(nowTime) {
        update(nowTime - mainloop_updateLast);
        display();
        mainloop_updateLast = nowTime;
        requestAnimationFrame(mainLoop);
    })(performance.now());
};