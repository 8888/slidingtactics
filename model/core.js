'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Walls = require('../model/wall.js');

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

class GameLogic {
    constructor() {
        this.board = null;
        this.playerPieces = [];
        this.player = null;
        this.clickedPiece = null; // used for user input movement
    }

    newGame() {
        let bg = new BoardGenerator();
        this.board = bg.generate();
        this.createPlayers();        
    }

    createPlayers() {
        Game.player = new GamePiece('#ff0000');        
        Game.player.setLocation(14 + 4 * 16);
        this.addPlayer(Game.player);
        for (let i = 0; i < 3; i++) {
            this.addPlayer(new GamePiece('#0000ff'));            
        }
        this.playerPieces[1].setLocation(12 + 3 * 16);
        this.playerPieces[2].setLocation(12 + 5 * 16);
        this.playerPieces[3].setLocation(10 + 14 * 16);
    }

    addPlayer(player) {
        this.playerPieces.push(player);
    }

    movePiece(piece, direction) {
        let moving = true;
        while (moving) {
            moving = false;
            let currentIndex = piece.location;
            let advancedIndex = currentIndex + Walls.delta[direction];
            if (
                0 <= advancedIndex && advancedIndex < 255
            ) {
                if (
                    !(this.board.item(advancedIndex) & Walls.reverse[direction]) &&
                    !(this.board.item(currentIndex) & direction) &&
                    !(this.playerFromCell(advancedIndex))
                ) {
                    piece.setLocation(advancedIndex);
                    moving = true;
                }
            }
        }
    }

    cellFromClick(x, y) {
        // returns what cell was clicked
        let cellX = Math.floor((x - originX) / spaceSize),
            cellY = Math.floor((y - originY) / spaceSize);
        if (cellX >= 0 && cellX < 16 && cellY >=0 && cellY < 16) {
            return cellX + cellY*16;
        }
    }

    playerFromCell(locationIndex) {
        // returns the player object from that cell
        for (let p = 0; p < this.playerPieces.length; p++) {
            if (this.playerPieces[p].location == locationIndex) {
                return this.playerPieces[p];
            }
        }
    }
}

function init() {
    Game = new GameLogic();
    Game.newGame();
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
                if (space & Walls.N) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r));
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r));
                }
                if (space & Walls.E) {
                    ctx.moveTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r));
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r) + spaceSize);
                }
                if (space & Walls.S) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r) + spaceSize);
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r) + spaceSize);                   
                }
                if (space & Walls.W) {
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
        Game.movePiece(Game.clickedPiece, Walls.W);
    }
    else if (event.key === "ArrowUp" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Walls.N);
    }
    else if (event.key === "ArrowRight" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Walls.E);
    }
    else if (event.key === "ArrowDown" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Walls.S);
    }
    Game.clickedPiece = null;   
});

window.onload = function() {
    init();
    var mainloop_updateLast = performance.now();
    (function mainLoop(nowTime) {
        //update(nowTime - mainloop_updateLast);
        display();
        mainloop_updateLast = nowTime;
        requestAnimationFrame(mainLoop);
    })(performance.now());
};