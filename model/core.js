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
        Game.player.setLocation(14, 4);
        this.addPlayer(Game.player);
        for (let i = 0; i < 3; i++) {
            this.addPlayer(new GamePiece('#0000ff'));            
        }
        this.playerPieces[1].setLocation(12, 3);
        this.playerPieces[2].setLocation(12, 5);
        this.playerPieces[3].setLocation(10, 14);
    }

    addPlayer(player) {
        this.playerPieces.push(player);
    }

    movePiece(piece, direction) {
        let moving = true;
        while (moving) {
            moving = false;
            let advancedCellY = piece.y + direction.yDelta;
            let advancedCellX = piece.x + direction.xDelta;
            if (
                0 <= advancedCellY && advancedCellY < this.board.length &&
                0 <= advancedCellX && advancedCellX < this.board.length
            ) {
                if (
                    !this.board[advancedCellY][advancedCellX].hasWall(Shared.directionReverse(direction)) &&
                    !this.board[piece.y][piece.x].hasWall(direction) &&
                    !this.playerFromCell(advancedCellX, advancedCellY)
                ) {
                    piece.setLocation(advancedCellX, advancedCellY);
                    moving = true;
                }
            }
        }
    }

    cellFromClick(x, y) {
        // returns what cell was clicked
        let cellX = Math.floor((x - originX) / spaceSize),
            cellY = Math.floor((y - originY) / spaceSize);
        if (cellX >= 0 && cellX < Game.board.length && cellY >=0 && cellY < Game.board.length) {
            return [cellX, cellY];
        }
    }

    playerFromCell(x, y) {
        // returns the player object from that cell
        for (let p = 0; p < this.playerPieces.length; p++) {
            if (this.playerPieces[p].x == x && this.playerPieces[p].y == y) {
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
        for (let p = 0; p < Game.playerPieces.length; p++) {
            ctx.beginPath();
            ctx.fillStyle = Game.playerPieces[p].color;
            ctx.arc(
                originX + (spaceSize * Game.playerPieces[p].x) + (spaceSize / 2),
                originY + (spaceSize * Game.playerPieces[p].y) + (spaceSize / 2),
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
            let player = Game.playerFromCell(cell[0], cell[1]);
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
        Game.movePiece(Game.clickedPiece, Shared.WEST);
    }
    else if (event.key === "ArrowUp" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Shared.NORTH);
    }
    else if (event.key === "ArrowRight" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Shared.EAST);
    }
    else if (event.key === "ArrowDown" && Game.clickedPiece) {
        Game.movePiece(Game.clickedPiece, Shared.SOUTH);
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