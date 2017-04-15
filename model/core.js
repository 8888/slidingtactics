'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js'),
    Goal = require('../model/goal.js'),
    Trail = require('../model/trail.js');

class GameLogic {
    constructor(x, y, spaceSize) {
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
        this.board = null;
        this.playerPieces = [];
        this.player = null;
        this.clickedPiece = null;
        this.moveHistory = []; // moves stored as [piece, direction, start, end]
        this.goal = null;
        this.moveTrail = [];
    }

    newGame() {
        let bg = new BoardGenerator();
        this.board = bg.generate();
        this.createPlayers();
        this.createGoal();
        this.moveHistory = [];
        this.moveTrail = [];
    }

    createPlayers() {
        this.playerPieces = [];
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

    createGoal() {
        this.goal = this.board.goals[Math.floor(Math.random() * this.board.goals.length)];
    }

    addPlayer(player) {
        this.playerPieces.push(player);
    }

    movePiece(piece, direction) {
        let lastMove = this.lastMove(piece);
        if (lastMove && lastMove[1] == Direction.reverse[direction]) {
            return;
        }
        let moving = true;
        let start = piece.location;
        while (moving) {
            moving = false;
            let currentIndex = piece.location;
            let advancedIndex = currentIndex + Direction.delta[direction];
            if (
                0 <= advancedIndex && advancedIndex <= 255
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
        if (piece.location != start) {
            this.moveHistory.push([piece, direction, start, piece.location]);
            this.moveTrail.push(new Trail(start, piece.location));
            if (this.playerReachedGoal()) {
                this.puzzleComplete();
            }
        }
    }

    lastMove(piece) {
        // returns the last move of the given GamePiece
        for (let m = this.moveHistory.length - 1; m >= 0; m--) {
            // itterate from back to front
            if (this.moveHistory[m][0] == piece) {
                return this.moveHistory[m];
            }
        }
    }

    playerReachedGoal() {
        // return if the player is on the goal
        if (this.player.location == this.goal) {
            return true;
        }
        else {
            return false;
        }
    }

    puzzleComplete() {
        this.newGame();
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

    onMouse1Down(x, y) {
        let cell = this.cellFromClick(x, y);
        if (cell !== undefined) {
            let player = this.playerFromCell(cell);
            if (player) {
                this.clickedPiece = player;
            }
            else {
                this.clickedPiece = null;
            }
        }
    }

    onMouse1Up() {
    
    }

    onDirection(direction) {
        if (this.clickedPiece) {
            this.movePiece(this.clickedPiece, direction);
        }
    }

    onDevSelect(index) {
        this.clickedPiece = this.playerPieces[index];
    }

    update(delta) {
        for (let t = 0; t < this.moveTrail.length; t++) {
            this.moveTrail[t].update(delta);
            if (!this.moveTrail[t].isActive) {
                this.moveTrail.splice(t, 1);
                t--;
            }
        }
    }

    display(ctx) {
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize;
        // draw the goal
        ctx.fillStyle = '#f442f1';
        ctx.beginPath();
        let goalX = this.goal % 16,
            goalY = Math.floor(this.goal / 16);
        ctx.rect(x + (cellWidth * goalX), y + (cellWidth * goalY), cellWidth, cellWidth);
        ctx.fill();
        // draw the outline
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
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
        // draw the move trail
        for (let i = 0; i < this.moveTrail.length; i++) {
            let m = this.moveTrail[i];
            ctx.beginPath();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = m.width;
            ctx.moveTo(x + (cellWidth * m.startX) + (cellWidth / 2), y + (cellWidth * m.startY) + (cellWidth / 2));
            ctx.lineTo(x + (cellWidth * m.endX) + (cellWidth / 2), y + (cellWidth * m.endY) + (cellWidth / 2));
            ctx.stroke();
        }
        // draw the pieces
        for (let i = 0; i < this.playerPieces.length; i++) {
            let p = this.playerPieces[i],
                py = Math.floor(p.location / 16),
                px = p.location % 16;
            ctx.beginPath();
            if (this.clickedPiece == p) {
                ctx.fillStyle = '#ffff00';
            }
            else {
                ctx.fillStyle = p.color;                
            }
            ctx.arc(
                x + (cellWidth * px) + (cellWidth / 2),
                y + (cellWidth * py) + (cellWidth / 2),
                cellWidth / 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }
}

module.exports = GameLogic;