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
    ctx = canvas.getContext("2d");
// Mouse
let mouseX = null,
    mouseY = null;
// Main Constants
let Game = null;
let Shared = null;
let Player = null;

class GameLogic {
    constructor() {
        this.board = this.null;
        this.players = [];
    }

    newGame() {
        let bg = new BoardGenerator();
        this.board = bg.generate();
        Player.setLocation(14, 4);
        this.addPlayer(Player);
    }

    addPlayer(player) {
        this.players.push(player);
    }
}

function init() {
    Game = new GameLogic();
    Player = new GamePiece();
    Game.newGame();
}

function display() {
    let originX = canvasBounds.left + 50,
        originY = canvasBounds.top + 50,
        boardSize = 16,
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
        for (let p = 0; p < Game.players.length; p++) {
            ctx.beginPath();
            ctx.fillStyle = '#ff0000';
            ctx.arc(
                originX + (spaceSize * Game.players[p].x) + (spaceSize / 2),
                originY + (spaceSize * Game.players[p].y) + (spaceSize / 2),
                10,
                0,
                2 * Math.PI
            );
        }
        ctx.fill();
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBoard();
    drawGamePieces();
}


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