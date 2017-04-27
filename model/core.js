'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js'),
    Goal = require('../model/goal.js'),
    Trail = require('../model/trail.js');

class GameLogic {
    constructor(ctxBack, ctxFore, ctxVFX, spriteSheet, seedGenerator,
            x, y, spaceSize, border,
            onGameNew, onGameOver
    ) {
        this.ctxBack = ctxBack;
        this.ctxFore = ctxFore;
        this.ctxVFX = ctxVFX;
        this.spriteSheet = spriteSheet;
        this.seedGenerator = seedGenerator;
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
        this.border = border;
        this.gameStates = {
            "newGame": "newGame",
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

    newGame() {
        this.state = this.gameStates.newGame;
        this.playerPieces = [];
        this.playerIndexByLocation = {};
        this.clickedPiece = null;
        this.moveHistory = []; // moves stored as [piece, direction, start, end]
        this.moveTrail = [];
        this.moveCount = 0;
        this.possibleMoves = [];
        this.possibleMovesDirty = [];
        this.playerLastMove = {};
        let that = this;
        this.seedGenerator.generate((s) => { that.onSeedGenerated(s); });
    }

    onSeedGenerated(seed) {
        this.state = this.gameStates.playing;
        this.ctxFore.clearRect(this.x, this.y, this.spaceSize * 16, this.spaceSize * 16);
        // keep drawing to the display only!!
        this.state = this.gameStates.playing;
        this.board = this.boardGenerator.generate(seed.b);
        this.goal = seed.g;
        this.goalX = this.x + (this.goal % 16) * this.spaceSize;
        this.goalY = this.y + Math.floor(this.goal / 16) * this.spaceSize;
        for (let i = 0; i < seed.p.length; i++) {
            let p = new GamePiece();
            p.setLocation(seed.p[i]);
            p.index = i;
            p.isDirty = true;
            this.playerPieces.push(p);
            this.playerIndexByLocation[p.location] = p.index;
        }

        this.player = this.playerPieces[0];
        // Draw once
        this.displayBoard();
        if (this.onGameNew) {
            this.onGameNew(this);
        }
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
        if (this.possibleMoves.length) {
            this.possibleMovesDirty = this.possibleMoves;
            this.possibleMoves = [];
        }
        if (piece) {
            let start = piece.location;
            for (let d = 0; d < Direction.ALL.length; d++) {
                let end = this.moveCell(start, Direction.ALL[d]);
                if (this.isMoveLegal(piece, Direction.ALL[d], end)) {
                    this.possibleMoves.push(end);
                }
            }
        }
    }

    puzzleComplete() {
        this.showPossibleMoves(null);
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
                        if ((this.clickedPiece.location - cell) % 16 === 0) {
                            direction = Direction.N;
                        } else {
                            direction = Direction.W;
                        }
                    } else {
                        if ((cell - this.clickedPiece.location) % 16 === 0) {
                            direction = Direction.S;
                        } else {
                            direction = Direction.E;
                        }
                    }
                    this.onDirection(direction);
                } else {
                    this.setClickedPiece(this.playerPieces[this.playerIndexByLocation[cell]]);
                    this.showPossibleMoves(this.clickedPiece);
                }
            }
        } else if (this.state == this.gameStates.gameOver) {
            if (this.x + (16 / 4) * this.spaceSize <= x && x <= (this.x + (16 / 4) * this.spaceSize) + (16 / 2) * this.spaceSize &&
                this.y + (16 / 4) * this.spaceSize <= y && y <= (this.y + (16 / 4) * this.spaceSize) + (16 / 2) * this.spaceSize
            ) {
                this.newGame();
            }
        }
    }

    onMouse1Up() {
    }

    setClickedPiece(piece) {
        if(this.clickedPiece != piece) {
            if(this.clickedPiece) {
                this.clickedPiece.isDirty = true;
            }

            if(piece) {
                piece.isDirty = true;
            }

            this.clickedPiece = piece;
        }
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
            this.setClickedPiece(this.playerPieces[index]);
        }
    }

    displayBoard() {
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize,
            ctx = this.ctxBack;
        ctx.lineWidth = 1;
        ctx.clearRect(x - this.border/2, y - this.border/2,
            cellWidth * 16 + this.border/2, cellWidth * 16 + this.border/2);
        // grid
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        for (let i = 1; i < boardSize; i++) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(136, 136, 136, 0.4)';
            ctx.moveTo(x + (cellWidth * i), y);
            ctx.lineTo(x + (cellWidth * i), y + (boardSize * cellWidth));
            ctx.moveTo(x, y + (cellWidth * i));
            ctx.lineTo(x + (boardSize * cellWidth), y + (cellWidth * i));
        }
        ctx.stroke();
        // all goal options
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
        ctx.setLineDash([0]);
        // draw the outline
        ctx.beginPath();
        ctx.lineWidth = this.spaceSize < 16*3 ? 1 : 2;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(x, y, (boardSize * cellWidth), (boardSize * cellWidth));
        // draw each space
        ctx.lineCap = 'round';
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
        ctx.lineCap = 'butt';
        ctx.lineWidth = 1;
        // draw the goal
        ctx.drawImage(this.spriteSheet, 0, cellWidth * 5, cellWidth, cellWidth, this.goalX, this.goalY, cellWidth, cellWidth);
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

    display() {
        if (this.state == this.gameStates.gameOver) {
            return;
        }

        let ctx = this.ctxFore;
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize;

        this.ctxVFX.clearRect(x, y, cellWidth * boardSize, cellWidth * boardSize);
        // draw the move trail
        let xW = 0,
            yW = 0;
        this.ctxVFX.beginPath();
        for (let i = 0, l = this.moveTrail.length; i < l; i++) {
            let m = this.moveTrail[i];
            this.ctxVFX.fillStyle = 'rgba(255, 255, 0, '+(m.width*2)/cellWidth+')';
            if (m.startX == m.endX) {
                xW = m.width;
                yW = 0;
            } else {
                xW = 0;
                yW = m.width;
            }
            this.ctxVFX.fillRect(
                x + (cellWidth * m.startX) + ((cellWidth - xW) / 2), y + (cellWidth * m.startY) + ((cellWidth -yW) / 2),
                (m.endX - m.startX) * cellWidth + xW, (m.endY - m.startY) * cellWidth + yW
            );
        }
        if (this.possibleMovesDirty.length) {
            // remove old possible moves
            for (let i = 0; i < this.possibleMovesDirty.length; i++) {
                let p = this.possibleMovesDirty[i],
                    py = Math.floor(p / boardSize),
                    px = p % boardSize;
                ctx.clearRect(x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
            this.possibleMovesDirty = [];
        }
        // draw the pieces
        for (let i = 0; i < this.playerPieces.length; i++) {
            let p = this.playerPieces[i];
            if (p.isDirty) {
                p.isDirty = false;
                let pL = p.locationPrevious;
                if (pL) {
                    ctx.clearRect(x + pL.x * cellWidth, y + pL.y * cellWidth, cellWidth, cellWidth);
                    p.locationPrevious = null;
                }
                let pIndex = (this.clickedPiece == p ? 1 : 0) + (this.player == p ? 0 : 2);
                ctx.drawImage(this.spriteSheet,
                    0, cellWidth * pIndex, cellWidth, cellWidth,
                    x + (cellWidth * p.x), y + (cellWidth * p.y), cellWidth, cellWidth);
            }
        }
        if (this.possibleMoves.length) {
            // draw the possible moves
            for (let i = 0; i < this.possibleMoves.length; i++) {
                let p = this.possibleMoves[i],
                    py = Math.floor(p / boardSize),
                    px = p % boardSize;
                ctx.drawImage(this.spriteSheet, 0, cellWidth * 4, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
        }
        // draw the level complete menu
        if (this.state == this.gameStates.levelComplete) {
            this.ctxVFX.beginPath();
            this.ctxVFX.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctxVFX.rect(x + (boardSize / 4) * cellWidth, y + (boardSize / 4) * cellWidth, (boardSize / 2) * cellWidth, (boardSize / 2) * cellWidth);
            this.ctxVFX.fill();
            this.ctxVFX.font = cellWidth.toString() + "px sans-serif";
            this.ctxVFX.fillStyle = "white";
            let text = this.moveCount + " moves!";
            this.ctxVFX.fillText(text, x + (boardSize / 4) * cellWidth + cellWidth, y + (boardSize / 2) * cellWidth - cellWidth);
            text = this.puzzlesSolved + " puzzles";
            this.ctxVFX.fillText(text, x + (boardSize / 4) * cellWidth + cellWidth, y + (boardSize / 2) * cellWidth + cellWidth);
            text = this.totalMoves + " moves!";
            this.ctxVFX.fillText(text, x + (boardSize / 4) * cellWidth + cellWidth, y + (boardSize / 2) * cellWidth + (cellWidth * 2));
            this.state = this.gameStates.gameOver;
        }
    }
}

module.exports = GameLogic;