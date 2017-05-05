'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js'),
    Goal = require('../model/goal.js'),
    Trail = require('../model/trail.js');

class GameLogic {
    constructor(view, seedGenerator,
            x, y, spaceSize, boardSize,
            onGameNew, onGameOver
    ) {
        this.view = view;
        this.seedGenerator = seedGenerator;
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
        this.boardSize = boardSize;
        this.gameStates = {
            "newGame": "newGame",
            "playing" : "playing",
            "levelComplete" : "levelComplete"
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
        this.moveHistory = []; // moves stored as {piece, direction, start, end}
        this.moveTrail = [];
        this.moveCount = 0;
        this.possibleMoves = [];
        this.possibleMovesDirty = [];
        this.playerLastMove = {};
        this.puzzle_key = null;
        this.puzzle_instance_key = null;
        let that = this;
        this.seedGenerator.generate((s) => { that.onSeedGenerated(s); });
        this.boardNeedsToBeDrawn = true;
    }

    onSeedGenerated(seed) {
        this.state = this.gameStates.playing;
        this.puzzle_key = seed.puzzle;
        this.puzzle_instance_key = seed.instance;
        this.board = this.boardGenerator.generate(seed.b);
        this.goal = {
            index: seed.g,
            x: this.x + (seed.g % this.boardSize) * this.spaceSize,
            y: this.y + Math.floor(seed.g / this.boardSize) * this.spaceSize
        };
        for (let i = 0; i < seed.p.length; i++) {
            let p = new GamePiece();
            p.setLocation(seed.p[i]);
            p.index = i;
            p.isDirty = true;
            this.playerPieces.push(p);
            this.playerIndexByLocation[p.location] = p.index;
        }

        this.player = this.playerPieces[0];
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
            this.moveHistory.push({
                'piece' : piece,
                'direction' : direction,
                'start' : start,
                'end' : piece.location
            });
            this.moveTrail.push(new Trail(start, piece.location, this.spaceSize));
            this.moveCount += 1;
            this.totalMoves += 1;
            if (this.moveHistory.length > 25) {
                this.moveHistory.shift();
            }
            if (this.player.location == this.goal.index) {
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
        } else if (piece == this.player && this.playerLastMove[piece.index] === undefined && end == this.goal.index) {
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

    undoLastMove() {
        if (this.moveHistory.length) {
            let move = this.moveHistory.pop(),
                p = move.piece;
            p.setLocation(move.start);
            let pIndex = this.playerIndexByLocation[move.end];
            delete this.playerIndexByLocation[move.end];
            this.playerIndexByLocation[p.location] = pIndex;
            this.moveCount -= 1;
            this.totalMoves -= 1;
            for (let m = this.moveHistory.length - 1; m >= 0; m--) {
                if (this.moveHistory[m].piece == p) {
                    this.playerLastMove[pIndex] = this.moveHistory[m].direction;
                    return;
                }
            }
            delete this.playerLastMove[pIndex]; // covers cases if this was pieces only move
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
        if (cellX >= 0 && cellX < this.boardSize && cellY >=0 && cellY < this.boardSize) {
            return cellX + cellY*this.boardSize;
        }
    }

    onMouse1Down(x, y) {
        if (this.state == this.gameStates.playing) {
            let cell = this.cellFromClick(x, y);
            if (cell !== undefined) {
                if (this.possibleMoves.indexOf(cell) != -1) {
                    let direction = null;
                    if (cell < this.clickedPiece.location) {
                        if ((this.clickedPiece.location - cell) % this.boardSize === 0) {
                            direction = Direction.N;
                        } else {
                            direction = Direction.W;
                        }
                    } else {
                        if ((cell - this.clickedPiece.location) % this.boardSize === 0) {
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
        } else if (this.state == this.gameStates.levelComplete) {
            if (this.x + (this.boardSize / 4) * this.spaceSize <= x && x <= (this.x + (this.boardSize / 4) * this.spaceSize) + (this.boardSize / 2) * this.spaceSize &&
                this.y + (this.boardSize / 4) * this.spaceSize <= y && y <= (this.y + (this.boardSize / 4) * this.spaceSize) + (this.boardSize / 2) * this.spaceSize
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

    onKeyDown(key) {
        if (key == 'u') {
            this.undoLastMove();
        }
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
        if (this.view && this.board) {
            if (this.boardNeedsToBeDrawn) {
                // only draw the board once
                this.view.displayBoard(this.board, this.goal.x, this.goal.y);
                this.boardNeedsToBeDrawn = false;
            }
            if (this.state == this.gameStates.playing) {
                this.view.display(this.moveTrail, this.possibleMovesDirty, this.playerPieces, this.possibleMoves, this.clickedPiece, this.player);
            } else if (this.state == this.gameStates.levelComplete && !this.view.levelComplete) {
                this.view.displayLevelCompleteMenu(this.moveCount, this.puzzlesSolved, this.totalMoves);
            }
        }
    }
}

module.exports = GameLogic;