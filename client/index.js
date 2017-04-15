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
    Game = new GameLogic();
    Game.newGame();
}

function update() {

}

function display() {
    let originX = canvasBounds.left + 50,
        originY = canvasBounds.top + 50,
        boardSize = Game.board.length,
        spaceSize = 30;

    function drawBoard() {
        let boardSize = 16;
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        // draw the outline
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + (boardSize * spaceSize), originY);
        ctx.lineTo(originX + (boardSize * spaceSize), originY + (boardSize * spaceSize));
        ctx.lineTo(originX, originY + (boardSize * spaceSize));
        ctx.lineTo(originX, originY);
        // draw each space
        for (let r = 0; r < boardSize; r++) {
            for (let s = 0; s < boardSize; s++) {
                let space = Game.board.item(r * boardSize + s);
                if (space & Direction.N) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r));
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r));
                }
                if (space & Direction.E) {
                    ctx.moveTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r));
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r) + spaceSize);
                }
                if (space & Direction.S) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r) + spaceSize);
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r) + spaceSize);                   
                }
                if (space & Direction.W) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r) + spaceSize);
                    ctx.lineTo(originX + (spaceSize * s), originY + (spaceSize * r));
                }
            }
        }
        ctx.stroke();
    }

    function drawGamePieces() {
        for (let i = 0; i < Game.playerPieces.length; i++) {
            let p = Game.playerPieces[i],
                y = Math.floor(p.location / 16),
                x = p.location % 16;
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(
                originX + (spaceSize * x) + (spaceSize / 2),
                originY + (spaceSize * y) + (spaceSize / 2),
                10,
                0,
                2 * Math.PI
            );
            ctx.fill();            
        }
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBoard();
    drawGamePieces();
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