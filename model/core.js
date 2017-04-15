'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js');

class GameLogic {
    constructor(x, y, spaceSize) {
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
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
        this.player = new GamePiece('#ff0000');        
        this.player.setLocation(14 + 4 * 16);
        this.addPlayer(this.player);
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
            let advancedIndex = currentIndex + Direction.delta[direction];
            if (
                0 <= advancedIndex && advancedIndex < 255
            ) {
                if (
                    !(this.board.item(advancedIndex) & Direction.reverse[direction]) &&
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
        let cellX = Math.floor((x - this.x) / this.spaceSize),
            cellY = Math.floor((y - this.y) / this.spaceSize);
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

    display(ctx) {
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize;
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        // draw the outline
        ctx.moveTo(x, y);
        ctx.lineTo(x + (boardSize * cellWidth), y);
        ctx.lineTo(x + (boardSize * cellWidth), y + (boardSize * cellWidth));
        ctx.lineTo(x, y + (boardSize * cellWidth));
        ctx.lineTo(x, y);
        // draw each space
        for (let r = 0; r < boardSize; r++) {
            for (let s = 0; s < boardSize; s++) {
                let space = this.board.item(r * boardSize + s);
                if (space & Direction.N) {
                    ctx.moveTo(x + (cellWidth * s), y + (cellWidth * r));
                    ctx.lineTo(x + (cellWidth * s) + cellWidth, y + (cellWidth * r));
                }
                if (space & Direction.E) {
                    ctx.moveTo(x + (cellWidth * s) + cellWidth, y + (cellWidth * r));
                    ctx.lineTo(x + (cellWidth * s) + cellWidth, y + (cellWidth * r) + cellWidth);
                }
                if (space & Direction.S) {
                    ctx.moveTo(x + (cellWidth * s), y + (cellWidth * r) + cellWidth);
                    ctx.lineTo(x + (cellWidth * s) + cellWidth, y + (cellWidth * r) + cellWidth);                   
                }
                if (space & Direction.W) {
                    ctx.moveTo(x + (cellWidth * s), y + (cellWidth * r) + cellWidth);
                    ctx.lineTo(x + (cellWidth * s), y + (cellWidth * r));
                }
            }
        }
        ctx.stroke();

        for (let i = 0; i < this.playerPieces.length; i++) {
            let p = this.playerPieces[i],
                py = Math.floor(p.location / 16),
                px = p.location % 16;
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(
                x + (cellWidth * px) + (cellWidth / 2),
                y + (cellWidth * py) + (cellWidth / 2),
                10,
                0,
                2 * Math.PI
            );
            ctx.fill();            
        }
    }
}

module.exports = GameLogic;