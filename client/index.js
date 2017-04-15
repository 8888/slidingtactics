'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

// Canvas Parameters
let canvas = document.getElementById("canvasElement");
canvas.tabIndex = 0;
canvas.focus();
let canvasWidth = canvas.width,
    canvasHeight = canvas.height,
    canvasBounds = canvas.getBoundingClientRect(),
    ctx = canvas.getContext("2d"),
    originX = 50,
    originY = 50,
    spaceSize = 30;
// Mouse
let mouseX = null,
    mouseY = null;

// Main Constants
let Game = null;
let Shared = null;
function init() {
    Game = new GameLogic(canvasBounds.left + 50, canvasBounds.top + 50, 30);
    Game.newGame();
}

function update() {

}

function display() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    Game.display(ctx);
}

canvas.addEventListener("mousedown", function(event) {
    if (event.button === 0) { // left click
        let cell = Game.cellFromClick(mouseX, mouseY);
        if (cell) {
            let player = Game.playerFromCell(cell);
            if (player) {
                Game.clickedPiece = player;
            }
        }
    }
});

canvas.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - canvasBounds.left;
    mouseY = event.clientY - canvasBounds.top;
});

canvas.addEventListener("mouseup", function(event) {
    if (event.button === 0) { // release left click
        Game.clickedPiece = null;
    }
});

canvas.addEventListener("keydown", function(event) { 
    if (event.key === "ArrowLeft" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Direction.W);
    }
    else if (event.key === "ArrowUp" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Direction.N);
    }
    else if (event.key === "ArrowRight" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Direction.E);
    }
    else if (event.key === "ArrowDown" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Direction.S);
    }
    Game.clickedPiece = null;   
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