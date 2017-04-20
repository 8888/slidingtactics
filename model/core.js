'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js'),
    Goal = require('../model/goal.js'),
    Trail = require('../model/trail.js');

class GameLogic {
    constructor(ctxBack, spriteSheet, x, y, spaceSize, border, onGameNew, onGameOver) {
        this.ctxBack = ctxBack;
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
        this.border = border;
        this.gameStates = {
            "playing" : "playing",
            "levelComplete" : "levelComplete",
            "gameOver": "gameOver"
        };
        this.totalMoves = 0;
        this.puzzlesSolved = 0;
        this.onGameNew = onGameNew;
        this.onGameOver = onGameOver;
        this.boardGenerator = new BoardGenerator();
        this.newGame();
    }

    seedGenerate() {
        //What we would have from a server
        let seed = this.boardGenerator.seedGenerate();
        return seed;
    }

    newGame() {
        this.state = this.gameStates.playing;
        let seed = this.seedGenerate();
        console.log(seed);
        this.board = this.boardGenerator.generate();
        this.createGoal();
        this.playerPieces = this.playersGenerate();

        //this.playerPieces = seed.p;
        this.playerIndexByLocation = {};
        this.player = this.playerPieces[0];
        for (let i = 0; i < this.playerPieces.length; i++) {
            let p = this.playerPieces[i];
            this.playerIndexByLocation[p.location] = p.index;
        }
        this.clickedPiece = null;
        this.moveHistory = []; // moves stored as [piece, direction, start, end]
        this.moveTrail = [];
        this.moveCount = 0;
        this.possibleMoves = []; // indexes of possible moves
        // Lookup data instead of searching
        this.playerLastMove = {};
        // Draw once
        this.displayBoard();
        if(this.onGameNew) {
            this.onGameNew(this);
        }
    }

    playersGenerate(goal) {
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
        let players = [];
        let p = new GamePiece();
        let l = randboardloc(players, goal);
        p.setLocation(l);
        p.index = 0;
        players.push(p);
        for (let i = 0; i < 3; i++) {
            let p = new GamePiece();
            let l = randboardloc(players, goal);
            p.setLocation(l);
            p.index = i+1;
            players.push(p);
        }

        return players;
    }

    createGoal() {
        this.goal = this.board.goals[Math.floor(Math.random() * this.board.goals.length)];
        this.goalX = this.x + (this.goal % 16) * this.spaceSize;
        this.goalY = this.y + Math.floor(this.goal / 16) * this.spaceSize;
    }

    moveCell(index, direction) {
        let moving = true,
            movementCount = 0,
            movementCountMax = 20,
            currentIndex = index,
            advancedIndex = null;
        while (moving && movementCount < movementCountMax) {
            moving = false;
            movementCount++;
            advancedIndex = currentIndex + Direction.delta[direction];
            if ( (0 <= advancedIndex && advancedIndex <= 255) &&
                !(this.board.item(advancedIndex) & Direction.reverse[direction]) &&
                !(this.board.item(currentIndex) & direction) &&
                (this.playerIndexByLocation[advancedIndex] === undefined)
            ) {
                currentIndex = advancedIndex;
                moving = true;
            }
        }
        if (moving) {
            throw new Error('Player continued moving past max limit!');
        }
        return currentIndex;
    }

    movePiece(piece, direction) {
        let start = piece.location,
            end = this.moveCell(start, direction);
        if (this.isMoveLegal(piece, direction, end)) {
            piece.setLocation(end);
            let pIndex = this.playerIndexByLocation[start];
            delete this.playerIndexByLocation[start];
            this.playerIndexByLocation[piece.location] = pIndex;
            this.playerLastMove[piece.index] = direction;
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

    isMoveLegal(piece, direction, end) {
        // piece object, direction object, end index. Returns bool
        if (piece.location == end) {
            return false;
        } else if (this.playerLastMove[piece.index] == Direction.reverse[direction]) {
            // can not move back the way you last came
            return false;
        } else if (piece == this.player && this.playerLastMove[piece.index] === undefined && end == this.goal) {
            // The main player piece must move once before moving onto the goal
            return false;
        } else {
            return true;
        }
    }

    showPossibleMoves(piece) {
        this.possibleMoves = [];
        let start = piece.location;
        for (let d = 0; d < Direction.ALL.length; d++) {
            let end = this.moveCell(start, Direction.ALL[d]);
            if (this.isMoveLegal(piece, Direction.ALL[d], end)) {
                this.possibleMoves.push(end);
            }
        }
    }

    puzzleComplete() {
        this.possibleMoves = [];
        this.puzzlesSolved += 1;
        this.state = this.gameStates.levelComplete;
        if(this.onGameOver) {
            this.onGameOver(this);
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

    onMouse1Down(x, y) {
        if (this.state == this.gameStates.playing) {
            let cell = this.cellFromClick(x, y);
            if (cell !== undefined) {
                if (this.possibleMoves.indexOf(cell) != -1) {
                    let direction = null;
                    if (cell < this.clickedPiece.location) {
                        // north or west
                        if ((this.clickedPiece.location - cell) % 16 === 0) {
                            direction = Direction.N;
                        } else {
                            direction = Direction.W;
                        }
                    } else {
                        // east or south
                        if ((cell - this.clickedPiece.location) % 16 === 0) {
                            direction = Direction.S;
                        } else {
                            direction = Direction.E;
                        }
                    }
                    this.onDirection(direction);
                } else {
                    this.possibleMoves = [];
                    this.clickedPiece = this.playerPieces[this.playerIndexByLocation[cell]];
                    if (this.clickedPiece) {
                        this.showPossibleMoves(this.clickedPiece);
                    }
                }
            }
        }
        else if (this.state == this.gameStates.gameOver) {
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
                if (this.clickedPiece) { // prior movePiece() may have won the game and deselected the piece
                    this.showPossibleMoves(this.clickedPiece);
                }
            }
        }
    }

    onDevDirection(direction) {
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
        // grid
        ctx.beginPath();
        for (let i = 1; i < boardSize; i++) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#888888';
            ctx.moveTo(x + (cellWidth * i), y);
            ctx.lineTo(x + (cellWidth * i), y + (boardSize * cellWidth));
            ctx.moveTo(x, y + (cellWidth * i));
            ctx.lineTo(x + (boardSize * cellWidth), y + (cellWidth * i));
        }
        ctx.stroke();
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
        if (this.state == this.gameStates.gameOver) {
            return;
        }
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize;
        ctx.clearRect(x, y, cellWidth * 16, cellWidth * 16);
        // draw the goal
        ctx.drawImage(this.spriteSheet, 0, cellWidth * 5, cellWidth, cellWidth, this.goalX, this.goalY, cellWidth, cellWidth);

        // draw the move trail
        ctx.strokeStyle = '#ffff00';
        for (let i = 0; i < this.moveTrail.length; i++) {
            let m = this.moveTrail[i];
            ctx.beginPath();
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
            if (this.player == p) {
                if (this.clickedPiece == p) {
                    ctx.drawImage(this.spriteSheet, 0, cellWidth * 1, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
                } else {
                    ctx.drawImage(this.spriteSheet, 0, cellWidth * 0, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
                }
            } else {
                if (this.clickedPiece == p) {
                    ctx.drawImage(this.spriteSheet, 0, cellWidth * 3, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
                } else {
                    ctx.drawImage(this.spriteSheet, 0, cellWidth * 2, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
                }
            }
        }
        // draw the possible moves
        if (this.possibleMoves.length > 0) {
            for (let i = 0; i < this.possibleMoves.length; i++) {
                let p = this.possibleMoves[i],
                    py = Math.floor(p / 16),
                    px = p % 16;
                ctx.drawImage(this.spriteSheet, 0, cellWidth * 4, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
        }
        // draw the level complete menu
        if (this.state == this.gameStates.levelComplete) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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
            this.state = this.gameStates.gameOver;
        }
    }
}

module.exports = GameLogic;