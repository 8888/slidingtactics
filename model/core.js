'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js'),
    Goal = require('../model/goal.js'),
    Trail = require('../model/trail.js');

class GameLogic {
    constructor(ctxBack, x, y, spaceSize, border) {
        this.ctxBack = ctxBack;
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
        this.border = border;
        this.gameStates = {
            "playing" : "playing",
            "levelComplete" : "levelComplete"
        };
        this.totalMoves = 0;
        this.puzzlesSolved = 0;
        this.newGame();
    }

    newGame() {
        this.state = this.gameStates.playing;        
        let bg = new BoardGenerator();
        this.board = bg.generate();
        this.createGoal();
        this.createPlayers();
        this.clickedPiece = null;
        this.moveHistory = []; // moves stored as [piece, direction, start, end]
        this.moveTrail = [];
        this.moveCount = 0;
        // Lookup data instead of searching
        this.playerLastMove = {};
        // Draw once
        this.displayBoard();
    }

    createPlayers() {
        let randboardloc = function(players, goal) {
            let noSpace = players.map(function(p) { return p.location; }).concat(goal).concat([119,120,135,136]);
            let space = null,
                attemptCount = 0,
                attemptCountMax = 20;
            while (space === null && attemptCount < attemptCountMax) {
                attemptCount++;
                let s = Math.floor(Math.random() * 16 * 16);
                if (noSpace.indexOf(s) === -1) {
                    space = s;
                }
            }

            if (space === null) {
                throw new Error('Could not place player!');
            }

            return space; 
        };
        this.playerPieces = [];
        this.playerIndexByLocation = {};
        this.player = new GamePiece('#ff0000');
        let l = randboardloc(this.playerPieces, this.goal);
        this.player.setLocation(l);
        this.playerIndexByLocation[l] = 0;
        this.addPlayer(this.player);
        for (let i = 0; i < 3; i++) {
            let p = new GamePiece('#0000ff');
            let l = randboardloc(this.playerPieces, this.goal);
            p.setLocation(l);
            this.playerIndexByLocation[l] = i+1;
            this.addPlayer(p);
        }
    }

    createGoal() {
        this.goal = this.board.goals[Math.floor(Math.random() * this.board.goals.length)];
        this.goalX = this.x + (this.goal % 16) * this.spaceSize + this.spaceSize * 0.1;
        this.goalY = this.y + Math.floor(this.goal / 16) * this.spaceSize + this.spaceSize * 0.1;
        this.goalW = this.spaceSize * 0.8;
    }

    addPlayer(player) {
        this.playerPieces.push(player);
    }

    movePiece(piece, direction) {
        if (this.playerLastMove[piece] == Direction.reverse[direction]) {
            return;
        }
        let moving = true,
            movementCount = 0,
            movementCountMax = 20;
        let start = piece.location;
        while (moving && movementCount < movementCountMax) {
            moving = false;
            movementCount++;
            let currentIndex = piece.location;
            let advancedIndex = currentIndex + Direction.delta[direction];
            if ( (0 <= advancedIndex && advancedIndex <= 255) &&
                !(this.board.item(advancedIndex) & Direction.reverse[direction]) &&
                !(this.board.item(currentIndex) & direction) &&
                (this.playerIndexByLocation[advancedIndex] === undefined)
            ) {
                piece.setLocation(advancedIndex);
                moving = true;
            }
        }

        if (moving) {
            throw new Error('Player continued moving past max limit!');
        }
        
        let pIndex = this.playerIndexByLocation[start];
        delete this.playerIndexByLocation[start];
        this.playerIndexByLocation[piece.location] = pIndex;
        if (piece.location != start) {
            this.playerLastMove[piece] = direction;
            this.moveHistory.push([piece, direction, start, piece.location]);
            this.moveTrail.push(new Trail(start, piece.location, this.spaceSize));
            this.moveCount += 1;
            this.totalMoves += 1;
            if (this.moveHistory.length > 25) {
                this.moveHistory.shift();
            }
            if (this.player.location == this.goal) {
                this.puzzleComplete();
            }
        }
    }

    puzzleComplete() {
        this.puzzlesSolved += 1;
        this.state = this.gameStates.levelComplete;
    }

    cellFromClick(x, y) {
        // returns what cell was clicked
        let cellX = Math.floor((x - this.x) / this.spaceSize),
            cellY = Math.floor((y - this.y) / this.spaceSize);
        if (cellX >= 0 && cellX < 16 && cellY >=0 && cellY < 16) {
            return cellX + cellY*16;
        }
    }

    onMouse1Down(x, y) {
        if (this.state == this.gameStates.playing) {
            let cell = this.cellFromClick(x, y);
            if (cell !== undefined) {
                this.clickedPiece = this.playerPieces[this.playerIndexByLocation[cell]];
            }
        }
        else if (this.state == this.gameStates.levelComplete) {
            if (this.x + (16 / 4) * this.spaceSize <= x && x <= (this.x + (16 / 4) * this.spaceSize) + (16 / 2) * this.spaceSize &&
                this.y + (16 / 4) * this.spaceSize <= y && y <= (this.y + (16 / 4) * this.spaceSize) + (16 / 2) * this.spaceSize
            ) {
                this.newGame();
            }
        }
    }

    onMouse1Up() {
    }

    onDirection(direction) {
        if (this.state == this.gameStates.playing) {
            if (this.clickedPiece) {
                this.movePiece(this.clickedPiece, direction);
            }
        }        
    }

    onDevSelect(index) {
        if (this.state == this.gameStates.playing) {
            this.clickedPiece = this.playerPieces[index];
        }
    }

    displayBoard() {
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize,
            ctx = this.ctxBack;
        ctx.clearRect(x - this.border/2, y - this.border, cellWidth * 16 + this.border, cellWidth * 16 + this.border + 1);
        // name of the board
        ctx.fillText(this.board.name, x, y-1);
        // all goal options
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(244, 66, 241, 0.5)';
        for(let i = 0; i < this.board.goals.length; i++) {
            let g = this.board.goals[i];
            let gX = g % 16,
                gY = Math.floor(g / 16);
            ctx.beginPath();
            ctx.arc(
                x + (cellWidth * gX) + (cellWidth / 2),
                y + (cellWidth * gY) + (cellWidth / 2),
                cellWidth / 4, 0, 2 * Math.PI
            );
            ctx.stroke();
        }
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
        ctx.beginPath();
        ctx.fillStyle = '#f442f1';
        ctx.rect(this.goalX, this.goalY, this.goalW, this.goalW);
        ctx.fill();

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
            ctx.fillStyle = p.color;
            ctx.arc(
                x + (cellWidth * px) + (cellWidth / 2),
                y + (cellWidth * py) + (cellWidth / 2),
                cellWidth / 2, 0, 2 * Math.PI
            );
            ctx.fill();
            if (this.clickedPiece == p) {
                ctx.beginPath();
                ctx.fillStyle = '#ffff00';
                ctx.arc(
                    x + (cellWidth * px) + (cellWidth / 2),
                    y + (cellWidth * py) + (cellWidth / 2),
                    cellWidth / 4, 0, 2 * Math.PI
                );
                ctx.fill();
            }
        }
        // draw the level complete menu
        if (this.state == this.gameStates.levelComplete) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,0,0,0.5';
            ctx.rect(x + (boardSize / 4) * cellWidth, y + (boardSize / 4) * cellWidth, (boardSize / 2) * cellWidth, (boardSize / 2) * cellWidth);
            ctx.fill();
            ctx.font = cellWidth.toString() + "px sans-serif";
            ctx.fillStyle = "white";            
            let text = this.moveCount + " moves!";
            ctx.fillText(text, x + (boardSize / 4) * cellWidth + cellWidth, y + (boardSize / 2) * cellWidth - cellWidth);
            text = this.puzzlesSolved + " puzzles";
            ctx.fillText(text, x + (boardSize / 4) * cellWidth + cellWidth, y + (boardSize / 2) * cellWidth + cellWidth);
            text = this.totalMoves + " moves!";
            ctx.fillText(text, x + (boardSize / 4) * cellWidth + cellWidth, y + (boardSize / 2) * cellWidth + (cellWidth * 2));
        }
    }
}

module.exports = GameLogic;