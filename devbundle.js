(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SlidingTacticsController = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

let SlidingTacticsController = require('../client/index.js'),
    PlayField = require('../model/devPlayField.js');

class DevSlidingTacticsController extends SlidingTacticsController {

    playfieldAdd(containerElementId) {
        let pf = new PlayField(containerElementId, 20, 10);
        this.playfields.push(pf);
    }
}

module.exports = DevSlidingTacticsController;

/*
    document.getElementById('myBody').innerHTML = `
            <table id='debugMenu' style='border-spacing: 6px;'><tr>
                <td><a href='?'>01x01=0001</a></td>
                <td><a href='?x=3&y=1'>03x01=0003</a></td>
                <td><a href='?x=4&y=2'>04x02=0008</a></td>
                <td><a href='?x=5&y=2'>05x02=0010</a></td>
                <td><a href='?x=6&y=3'>06x03=0018</a></td>
                <td><a href='?x=20&y=10'>20x10=0200</a></td>
                <td><a href='?x=28&y=15'>28x15=0420</a></td>
                <td><a href='?x=50&y=25'>50x25=1250</a></td>
                <td></td>
                <td><a id='cF'>[Fore Canvas]</a></td>
                <td><a id='cB'>[Back Canvas]</a></td>
                <td><a id='cD'>[Debu Canvas]</a></td>
                <td></td>
                <td><a id='commandNorm'>[Norm Commands]</a></td>
                <td><a id='commandFast'>[Fast Commands]</a></td>
            </tr></table>` + document.getElementById('myBody').innerHTML;

    let hideElement = function(id) {
        document.getElementById(id).style.display = 
            document.getElementById(id).style.display == "none" ?
            "inline" : "none";
    };
    document.getElementById('cF').onclick = function() { hideElement('cnvsForeground'); };
    document.getElementById('cB').onclick = function() { hideElement('cnvsBackground'); };
    document.getElementById('cD').onclick = function() { hideElement('cnvsDebug'); };
*/
},{"../client/index.js":2,"../model/devPlayField.js":7}],2:[function(require,module,exports){
'use strict';

let PlayField = require('../model/playfield.js');

class SlidingTacticsController {
    constructor() {
        this.playfields = [];
    }

    playfieldAdd(containerElementId) {
        let pf = new PlayField(containerElementId);
        this.playfields.push(pf);
    }

    play() {
        for(let i = 0; i < this.playfields.length; i++) {
            let p = this.playfields[i];
            p.play();
        }
    }
}

module.exports = SlidingTacticsController;
},{"../model/playfield.js":11}],3:[function(require,module,exports){
'use strict';

let t = require('../model/testUtility.js'),
    Shared = require('../model/direction.js');

class Board {
    constructor(name, type) {
        /*  name: string - id for this section(s)
            type: string - edition this board is from
        */
        t.assertString(name);
        t.assertString(type);

        this.name = name;
        this.type = type;
        this.area = [];
        this.goals = [];
    }

    item(index) {
        return this.area[index];
    }

    rotate(iterations, section, goals) {
        iterations = t.defaultValue(iterations, 1);
        t.assertIntegerPositive(iterations);
        section = t.defaultValue(section, this.area.slice());
        goals = t.defaultValue(goals, this.goals.slice());
        if (iterations === 0) {
            return [section, goals];
        }

        let areaCopy = section.slice();
        let width = Math.sqrt(this.area.length);
        for(let c = 0; c < width; c++) {
            for(let r = width-1; r >= 0; r--) {
                let s = areaCopy[c + r*width];
                let s2 = 0;
                for(let i = 0; i < Shared.ALL.length; i++) {
                    let d = Shared.ALL[i];
                    if (s & d) {
                        s2 += Shared.rotate[d];
                    }
                }
                section[width - 1 - r + c*width] = s2;
            }
        }

        let goalsRotated = [];
        for(let i = 0; i < goals.length; i++){
            let g = goals[i];
            let y = g[1],
                x = g[0];
            goalsRotated.push([width-1-y, x]);
        }

        return this.rotate(iterations-1, section, goalsRotated);
    }
}

module.exports = Board;
},{"../model/direction.js":8,"../model/testUtility.js":12}],4:[function(require,module,exports){
'use strict';

let BoardPieces = require('../model/boardPieces.js'),
    Board = require('../model/board.js'),
    Shared = require('../model/direction.js');

class BoardGenerator {
    constructor() {
        this.boardWidth = 8;
        let N = Shared.N, E = Shared.E, S = Shared.S, W = Shared.W;
        this.boardTemplate = [
            W|N, N, N, N, N, N, N, N,
            W, 0, 0, 0, 0, 0, 0, 0,
            W, 0, 0, 0, 0, 0, 0, 0,
            W, 0, 0, 0, 0, 0, 0, 0,
            W, 0, 0, 0, 0, 0, 0, 0,
            W, 0, 0, 0, 0, 0, 0, 0,
            W, 0, 0, 0, 0, 0, 0, 0,
            W, 0, 0, 0, 0, 0, 0, W|N
        ];
        this.boardSections = [];
        for(let i = 0, w = BoardPieces.length; i < w; i++) {
            let section = BoardPieces[i];
            let board = new Board(section.id, section.type);
            board.area = this.boardTemplate.slice();
            for(let a = 0; a < section.walls.length; a++) {
                let wall = section.walls[a];
                for(let d = 0; d < wall[2].length; d++) {
                    let direction = wall[2][d];
                    board.area[wall[0] + wall[1] * this.boardWidth] |= Shared[direction];
                }
            }

            for(let a = 0; a < section.goals.length; a++) {
                let g = section.goals[a];
                board.goals.push([g[0], g[1]]);
            }

            this.boardSections.push(board);
        }
    }

    generate() {
        let xy2index = function(g) { return g[0] + g[1] * 16; };
        let names = [];
        let section = [];
        let boardSectionsLength = this.boardSections.length;
        for(let i = 0; i < 4; i++) {
            let b = this.boardSections[Math.floor(Math.random() * boardSectionsLength)];
            section.push(b.rotate(i));
            names.push(b.name);
        }

        let boardTop = [],
            boardBot = [];
        for(let i = 0; i < this.boardWidth; i++) {
            boardTop.push(...section[0][0].splice(0, this.boardWidth));
            boardTop.push(...section[1][0].splice(0, this.boardWidth));
            boardBot.push(...section[3][0].splice(0, this.boardWidth));
            boardBot.push(...section[2][0].splice(0, this.boardWidth));
        }

        let board = new Board(names.join(), "classic");
        board.area = boardTop.concat(boardBot);
        let thisBoardWidth = this.boardWidth;
        board.goals = section[0][1].map(xy2index).concat(
            section[1][1].map(function(g){ return xy2index([g[0] + thisBoardWidth, g[1]]); }),
            section[2][1].map(function(g){ return xy2index([g[0] + thisBoardWidth, g[1] + thisBoardWidth]); }),
            section[3][1].map(function(g){ return xy2index([g[0], g[1] + thisBoardWidth]); })
        );
        return board;
    }
}

module.exports = BoardGenerator;
},{"../model/board.js":3,"../model/boardPieces.js":5,"../model/direction.js":8}],5:[function(require,module,exports){
'use strict';

let boardPieces = 
[
	{
		"id": "A1",
		"type": "classic",
		"walls":[
			[1, 0, "E"],
			[4, 1, "NW"],
			[1, 2, "NE"],
			[6, 3, "SE"],
			[0, 5, "S"],
			[3, 6, "SW"]
		],
		"goals":[
			[4, 1, "R"],
			[1, 2, "G"],
			[6, 3, "Y"],
			[3, 6, "B"]
		]
	},
	{
		"id": "A2",
		"type": "classic",
		"walls":[
			[3, 0, "E"],
			[5, 1, "SE"],
			[1, 2, "SW"],
			[0, 3, "S"],
			[6, 4, "NW"],
			[2, 6, "NE"]
		],
		"goals":[
			[5, 1, "G"],
			[1, 2, "R"],
			[6, 4, "Y"],
			[2, 6, "B"]
		]
	},
	{
		"id": "A3",
		"type": "classic",
		"walls":[
			[3, 0, "E"],
			[5, 2, "SE"],
			[0, 4, "S"],
			[2, 4, "NE"],
			[7, 5, "SW"],
			[1, 6, "NW"]
		],
		"goals":[
			[5, 2, "B"],
			[2, 4, "G"],
			[7, 5, "R"],
			[1, 6, "Y"]
		]
	},
	{
		"id": "A4",
		"type": "classic",
		"walls":[
			[3, 0, "E"],
			[6, 1, "SW"],
			[1, 3, "NE"],
			[5, 4, "NW"],
			[2, 5, "SE"],
			[7, 5, "SE"],
			[0, 6, "S"]
		],
		"goals":[
			[6, 1, "B"],
			[1, 3, "Y"],
			[5, 4, "G"],
			[2, 5, "R"],
			[7, 5, "BYGR"]
		]
	},
	{
		"id": "B1",
		"type": "classic",
		"walls":[
            [4, 0, "E"],
            [6, 1, "SE"],
            [1, 2, "NW"],
            [0, 5, "S"],
            [6, 5, "NE"],
            [3, 6, "SW"]
		],
		"goals":[
			[6, 1, "Y"],
			[1, 2, "G"],
			[6, 5, "B"],
			[3, 6, "R"]
		]
	},
	{
		"id": "B2",
		"type": "classic",
		"walls":[
			[4, 0, "E"],
			[2, 1, "NW"],
			[6, 3, "SW"],
			[0, 4, "S"],
			[4, 5, "NE"],
			[1, 6, "SE"]
		],
		"goals":[
			[2, 1, "Y"],
			[6, 3, "B"],
			[4, 5, "R"],
			[1, 6, "G"]
		]
	},
	{
		"id": "B3",
		"type": "classic",
		"walls":[
            [3, 0, "E"],
            [1, 1, "SW"],
            [6, 2, "NE"],
            [2, 4, "SE"],
            [0, 5, "S"],
            [7, 5, "NW"]
		],
		"goals":[
			[1, 1, "R"],
			[6, 2, "G"],
			[2, 4, "B"],
			[7, 5, "Y"]
		]
	},
	{
		"id": "B4",
		"type": "classic",
		"walls":[
            [4, 0, "E"],
            [2, 1, "SE"],
            [1, 3, "SW"],
            [0, 4, "S"],
            [6, 4, "NW"],
            [5, 6, "NE"],
            [3, 7, "SE"]
		],
		"goals":[
			[2, 1, "R"],
			[1, 3, "G"],
			[6, 4, "Y"],
			[5, 6, "B"],
			[3, 7, "RGYB"]
		]
	},
	{
		"id": "C1",
		"type": "classic",
		"walls":[
            [1, 0, "E"],
            [3, 1, "NW"],
            [6, 3, "SE"],
            [1, 4, "SW"],
            [0, 6, "S"],
            [4, 6, "NE"]
		],
		"goals":[
			[3, 1, "G"],
			[6, 3, "Y"],
			[1, 4, "R"],
			[4, 6, "B"]
		]
	},
	{
		"id": "C2",
		"type": "classic",
		"walls":[
            [5, 0, "E"],
            [3, 2, "NW"],
            [0, 3, "S"],
            [5, 3, "SW"],
            [2, 4, "NE"],
            [4, 5, "SE"]
		],
		"goals":[
			[3, 2, "Y"],
			[5, 3, "B"],
			[2, 4, "R"],
			[4, 5, "G"]
		]
	},
	{
		"id": "C3",
		"type": "classic",
		"walls":[
            [1, 0, "E"],
            [4, 1, "NE"],
            [1, 3, "SW"],
            [0, 5, "S"],
            [5, 5, "NW"],
            [3, 6, "SE"]
		],
		"goals":[
			[4, 1, "G"],
			[1, 3, "R"],
			[5, 5, "Y"],
			[3, 6, "B"]
		]
	},
	{
		"id": "C4",
		"type": "classic",
		"walls":[
            [2, 0, "E"],
            [5, 1, "SW"],
            [7, 2, "SE"],
            [0, 3, "S"],
            [3, 4, "SE"],
            [6, 5, "NW"],
            [1, 6, "NE"]
		],
		"goals":[
			[5, 1, "B"],
			[7, 2, "BRGY"],
			[3, 4, "R"],
			[6, 5, "G"],
			[1, 6, "Y"]
		]
	},
	{
		"id": "D1",
		"type": "classic",
		"walls":[
            [5, 0, "E"],
            [1, 3, "NW"],
            [6, 4, "SE"],
            [0, 5, "S"],
            [2, 6, "NE"],
            [3, 6, "SW"]
		],
		"goals":[
			[1, 3, "R"],
			[6, 4, "Y"],
			[2, 6, "G"],
			[3, 6, "B"]
		]
	},
	{
		"id": "D2",
		"type": "classic",
		"walls":[
            [2, 0, "E"],
            [5, 2, "SE"],
            [6, 2, "NW"],
            [1, 5, "SW"],
            [0, 6, "S"],
            [4, 7, "NE"]
		],
		"goals":[
			[5, 2, "G"],
			[6, 2, "Y"],
			[1, 5, "R"],
			[4, 7, "B"]
		]
	},
	{
		"id": "D3",
		"type": "classic",
		"walls":[
            [4, 0, "E"],
            [0, 2, "S"],
            [6, 2, "SE"],
            [2, 4, "NE"],
            [3, 4, "SW"],
            [5, 6, "NW"]
		],
		"goals":[
			[6, 2, "B"],
			[2, 4, "G"],
			[3, 4, "R"],
			[5, 6, "Y"]
		]
	},
	{
		"id": "D4",
		"type": "classic",
		"walls":[
            [4, 0, "E"],
            [6, 2, "NW"],
            [2, 3, "NE"],
            [3, 3, "SW"],
            [1, 5, "SE"],
            [0, 6, "S"],
            [5, 7, "SE"]
		],
		"goals":[
			[6, 2, "Y"],
			[2, 3, "B"],
			[3, 3, "G"],
			[1, 5, "R"],
			[5, 7, "YBGR"]
		]
	}
];

module.exports = boardPieces;
},{}],6:[function(require,module,exports){
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
            "levelComplete" : "levelComplete",
            "gameOver": "gameOver"
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
        this.possibleMoves = []; // indexes of possible moves
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
        this.player.index = 0;
        this.playerIndexByLocation[l] = 0;
        this.addPlayer(this.player);
        for (let i = 0; i < 3; i++) {
            let p = new GamePiece('#0000ff');
            let l = randboardloc(this.playerPieces, this.goal);
            p.setLocation(l);
            p.index = i+1;
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
                this.showPossibleMoves(this.clickedPiece);
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
        ctx.fillStyle = '#f442f1';
        ctx.fillRect(this.goalX, this.goalY, this.goalW, this.goalW);

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
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(
                x + (cellWidth * px) + (cellWidth / 2),
                y + (cellWidth * py) + (cellWidth / 2),
                cellWidth / 2, 0, 2 * Math.PI
            );
            ctx.fill();
            if (this.clickedPiece == p) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ffff00';
                ctx.stroke();
                ctx.lineWidth = 1;
            }
        }
        // draw the possible moves
        if (this.possibleMoves.length > 0) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffff00';                        
            for (let i = 0; i < this.possibleMoves.length; i++) {
                let p = this.possibleMoves[i],
                    py = Math.floor(p / 16),
                    px = p % 16;
                ctx.beginPath();                
                ctx.arc(
                    x + (cellWidth * px) + (cellWidth / 2),
                    y + (cellWidth * py) + (cellWidth / 2),
                    cellWidth / 2, 0, 2 * Math.PI
                );
                ctx.stroke();
            }
            ctx.lineWidth = 1;            
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
},{"../model/boardGenerator.js":4,"../model/direction.js":8,"../model/gamePiece.js":9,"../model/goal.js":10,"../model/trail.js":13}],7:[function(require,module,exports){
'use strict';

let PlayField = require('../model/playfield.js'),
    Direction = require('../model/direction.js');

class DevPlayField extends PlayField {

    constructor(containerElementId, x, y) {
        super(containerElementId);
        this.gameWidth = x;
        this.gameHeight = y;
        let container = document.getElementById(containerElementId);
        this.canvasDebu = super.canvasCreate(containerElementId+'_debuCavnas', 3);
        this.canvasDebu.style.display = 'none';
        this.ctxDebu = this.canvasDebu.getContext('2d');
        container.appendChild(this.canvasDebu);
        this.devAutoCommandEnabled = true;
        this.fpsTextDelta = null;
        this.fpsTextSum = null;
        this.commandsCountMax = 20;
        this.commandDetla = 0;
        this.commandDelay = 30;
        this.devSelect2Text = {0: '2673', 1: '2674', 2: '2675', 3: '2676'};
        this.commandDelayTemplate = [[600, 'Slow'], [200, 'Norm'], [30, 'Fast']];
        this.gameInstanceTemplate = [
            [1, 1, '01x01=0001'],
            [3, 1, '03x01=0003'],
            [4, 2, '04x02=0008'],
            [5, 2, '05x02=0010'],
            [6, 3, '06x03=0018'],
            [20, 10, '20x10=0200'],
            [28, 15, '28x15=0420'],
            [50, 25, '50x25=1250']
        ];
    }

    init() {
        super.init();
        this.commands = [];
        this.fps = {
            frames: 60,
            deltas: [],
            sum: 0
        };
        let l = this.gameInstanceTemplate.length,
            cl = this.commandDelayTemplate.length,
            h = 24 * (l+cl);
        this.ctxDebu.lineWidth = 1;
        this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
        this.ctxDebu.clearRect(this.canvasWidth - 100, this.canvasHeight - 48 - h, 100, h);
        this.ctxDebu.fillRect(this.canvasWidth - 100, this.canvasHeight - 48 - h, 100, h);
        this.ctxDebu.font = '14px sans-serif';
        this.ctxDebu.fillStyle = 'black';
        for(let i = 0; i < l; i++) {
            let t = this.gameInstanceTemplate[l-i-1];
            this.ctxDebu.fillText(t[2], this.canvasWidth - 90, this.canvasHeight - 48 - 24 * (i + 0.4));
            this.ctxDebu.strokeRect(this.canvasWidth - 100, this.canvasHeight - 48 - 24 * (i+1), 100, 24);
        }

        for(let i = 0; i < cl; i++) {
            let t = this.commandDelayTemplate[cl-i-1];
            this.ctxDebu.fillText(t[1], this.canvasWidth - 65, this.canvasHeight - 48 - 24 * (l+i + 0.4));
            this.ctxDebu.strokeRect(this.canvasWidth - 100, this.canvasHeight - 48 - 24 * (l+i+1), 100, 24);
        }

        /* Board Names
        this.ctxDebu.fillStyle = 'red';
        this.ctxDebu.font = this.gameBorder + "px sans-serif";
        for(let i = 0; i < this.gameInstances.length; i++) {
            let g = this.gameInstances[i];
            this.ctxDebu.fillText(g.board.name, g.x, g.y-1);
        }*/
    }

    eventListenersAttach() {
        super.eventListenersAttach();
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        this.canvasDebu.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                let l = that.gameInstanceTemplate.length + that.commandDelayTemplate.length;
                let y = Math.floor((event.layerY - (that.canvasDebu.height - 48 - 24 * l)) / 24),
                    x = event.layerX;
                if (x > that.canvasWidth - 100 && x < that.canvasWidth) {
                    if (y < 0) {
                    } else if (y < that.commandDelayTemplate.length) {
                        that.commandDelay = that.commandDelayTemplate[y][0];
                    } else if (y < l) {
                        let gi = that.gameInstanceTemplate[y-that.commandDelayTemplate.length];
                        that.gameWidth = gi[0];
                        that.gameHeight = gi[1];
                        that.init();
                    }
                }
                
            }
        });

        this.canvasFore.addEventListener("keydown", function(event) {
            let devSelect = null;
            if (event.key === "1") {
                devSelect = 0;
            } else if (event.key === "2") {
                devSelect = 1;
            } else if (event.key === "3") {
                devSelect = 2;
            } else if (event.key === "4") {
                devSelect = 3;
            }

            if (devSelect !== null) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDevSelect(devSelect);
                }
            }
        });

        window.addEventListener("keydown", function(event) {
            if (event.key == '`') {
                let s = that.canvasDebu.style.display;
                that.canvasDebu.style.display = s == 'none' ? 'inline' : 'none';
            } else if (event.key == 'f') {
                let s = that.canvasFore.style.display;
                that.canvasFore.style.display = s == 'none' ? 'inline' : 'none';
            } else if (event.key == 'b') {
                let s = that.canvasBack.style.display;
                that.canvasBack.style.display = s == 'none' ? 'inline' : 'none';
            } else if (event.key == "p") {
                that.devAutoCommandEnabled = !that.devAutoCommandEnabled;
            }
        });
    }

    update(delta) {
        super.update(delta);
        this.commandDetla += delta;
        if (this.commandDetla > this.commandDelay && this.devAutoCommandEnabled) {
            this.commandDetla = 0;
            let roll = Math.random();
            let c = null;
            if (roll < 0.85 && this.commands.length) {
                c = Direction.ALL[Math.floor(Math.random() * Direction.ALL.length)];
                this.commands.push(Direction.unicode[c]);
                for(let i = 0; i < this.gameInstances.length; i++) {
                    this.gameInstances[i].onDevDirection(c);
                }
            } else {
                c = Math.floor(Math.random() * 4);
                this.commands.push(this.devSelect2Text[c]);
                for(let i = 0; i < this.gameInstances.length; i++) {
                    this.gameInstances[i].onDevSelect(c);
                }
            }

            if (this.commands.length > this.commandsCountMax) {
                this.commands.shift();
            }
        }

        this.fps.deltas.unshift(delta);
        if (this.fps.deltas.length > this.fps.frames) {
            this.fps.deltas.pop();
        }
        this.fps.sum = this.fps.deltas.reduce(function(a, b) { return a + b; });
    }

    display() {
        super.display();
        if (this.canvasDebu.style.display !== 'none') {
            if (this.commands.length) {
                let l = this.commands.length;
                this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
                this.ctxDebu.clearRect(this.gameBorder, this.canvasHeight - 48, 48 * this.commandsCountMax, 48);
                this.ctxDebu.fillRect(this.gameBorder, this.canvasHeight - 48, 48 * this.commandsCountMax, 48);
                this.ctxDebu.strokeRect(this.gameBorder, this.canvasHeight - 48, 48 * this.commandsCountMax, 48);
                this.ctxDebu.font = "48px sans-serif";
                for(let i = 0; i < l; i++) {
                    let c = this.commands[i];
                    this.ctxDebu.fillStyle = i == l - 1 ? 'red' : 'black';
                    this.ctxDebu.fillText(String.fromCharCode(parseInt(c, 16)), this.gameBorder + 48 * (l - i -1), this.canvasHeight-8);
                }
            }

            let deltaText = this.fps.deltas[0], sumText = this.fps.sum;
            if (deltaText != this.fpsTextDelta || sumText != this.fpsTextSum) {
                this.ctxDebu.fillStyle = 'rgba(112,128,144,0.4)';
                this.ctxDebu.clearRect(this.canvasWidth - 200, this.canvasHeight - 48, 200, 48);
                this.ctxDebu.fillRect(this.canvasWidth - 200, this.canvasHeight - 48, 200, 48);
                this.ctxDebu.strokeRect(this.canvasWidth - 200, this.canvasHeight - 48, 200, 48);
                this.fpsTextDelta = deltaText;
                this.fpsTextSum = sumText;
                let fpsText = this.fpsTextDelta.toFixed(2).toString() + "ms " + (1000/(this.fpsTextSum/this.fps.frames)).toFixed(0) + "fps";
                this.ctxDebu.font = "24px sans-serif";
                this.ctxDebu.fillStyle = 'red';
                this.ctxDebu.fillText(fpsText, this.canvasWidth - 195, this.canvasHeight-12);
            }
        }
    }
}

module.exports = DevPlayField;
},{"../model/direction.js":8,"../model/playfield.js":11}],8:[function(require,module,exports){
'use strict';

let direction = {
    N: 0b1,
    E: 0b10,
    S: 0b100,
    W: 0b1000
};

direction.reverse = {};
direction.reverse[direction.N] = direction.S;
direction.reverse[direction.E] = direction.W;
direction.reverse[direction.S] = direction.N;
direction.reverse[direction.W] = direction.E;

direction.rotate = {};
direction.rotate[direction.N] = direction.E;
direction.rotate[direction.E] = direction.S;
direction.rotate[direction.S] = direction.W;
direction.rotate[direction.W] = direction.N;

direction.ALL = [
    direction.W,
    direction.S,
    direction.E,
    direction.N
];

direction.delta = {};
direction.delta[direction.N] = -16;
direction.delta[direction.E] = 1;
direction.delta[direction.S] = 16;
direction.delta[direction.W] = -1;

direction.unicode = {};
direction.unicode[direction.N] = '261D';
direction.unicode[direction.E] = '261E';
direction.unicode[direction.S] = '261F';
direction.unicode[direction.W] = '261C';

module.exports = direction;
},{}],9:[function(require,module,exports){
'use strict';

class GamePiece {
    constructor(color) {
        this.color = color;
    }

    setLocation(locationIndex) {
        this.location = locationIndex;
    }
}

module.exports = GamePiece;
},{}],10:[function(require,module,exports){
'use strict';

class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

module.exports = Goal;
},{}],11:[function(require,module,exports){
'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

class PlayField {
    constructor(containerElementId) {
        let container = document.getElementById(containerElementId);
        this.canvasFore = this.canvasCreate(containerElementId + '_foreCanvas', 2);
        this.canvasBack = this.canvasCreate(containerElementId + '_backCanvas', 1);
        container.appendChild(this.canvasFore);
        container.appendChild(this.canvasBack);
        this.canvasFore.tabIndex = 0;
        this.canvasFore.focus();
        this.canvasBack.style.background = 'Lavender';
        this.ctxFore = this.canvasFore.getContext('2d');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.canvasWidth = this.canvasFore.width;
        this.canvasHeight = this.canvasFore.height;
        this.gameInstances = [];
        this.gameWidth = 1;
        this.gameHeight = 1;
        this.gameBorder = 10;
        this.cellSpace = null;
        this.mouseX = null;
        this.mouseY = null;
    }

    canvasCreate(id, zIndex) {
        let canvas = document.createElement('CANVAS');
        canvas.id = id;
        canvas.style = 'z-index: '+zIndex+';';
        canvas.setAttribute('class', 'cnvs');
        canvas.setAttribute('width', 1280);
        canvas.setAttribute('height', 720);
        canvas.oncontextmenu = 'return false;';
        return canvas;
    }

    play() {
        let that = this;
        window.onload = function() {
            that.init();
            that.eventListenersAttach();
            var mainloop_updateLast = performance.now();
            (function mainLoop(nowTime) {
                that.update(nowTime - mainloop_updateLast);
                that.display();
                mainloop_updateLast = nowTime;
                requestAnimationFrame(mainLoop);
            })(performance.now());
        };
    }

    init() {
        let cellSpaceX = (this.canvasFore.width / this.gameWidth - this.gameBorder * 2) / 16,
            cellSpaceY = (this.canvasFore.height / this.gameHeight - this.gameBorder * 2) / 16;
        this.cellSpace = Math.max(Math.min(cellSpaceX, cellSpaceY), 1);
        this.gameInstances = [];
        this.ctxFore.clearRect(0, 0, this.canvasFore.width, this.canvasFore.height);
        this.ctxBack.clearRect(0, 0, this.canvasBack.width, this.canvasBack.height);
        for(let x = 0; x < this.gameWidth; x++) {
            for(let y = 0; y < this.gameHeight; y++) {
                let g = new GameLogic(
                    this.ctxBack,
                    (this.gameBorder + this.cellSpace * 16) * x + this.gameBorder,
                    this.gameBorder + (this.gameBorder + this.cellSpace * 16) * y,
                    this.cellSpace,
                    this.gameBorder);
                this.gameInstances.push(g);
            }
        }
    }

    eventListenersAttach() {
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        this.canvasFore.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Down(that.mouseX, that.mouseY);
                }
            }
        });

        this.canvasFore.addEventListener("mousemove", function(event) {
            that.mouseX = event.layerX;
            that.mouseY = event.layerY;
        });

        this.canvasFore.addEventListener("mouseup", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Up(that.mouseX, that.mouseY);
                }
            }
        });

        this.canvasFore.addEventListener("keydown", function(event) {
            let direction = null;
            if (event.key === "ArrowLeft") {
                direction = Direction.W;
            } else if (event.key === "ArrowUp") {
                direction = Direction.N;
            } else if (event.key === "ArrowRight") {
                direction = Direction.E;
            } else if (event.key === "ArrowDown") {
                direction = Direction.S;
            }

            if (direction) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDirection(direction);
                }
            }
        });
    }

    update(delta) {
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].update(delta);
        }
    }

    display() {
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].display(this.ctxFore);
        }
    }
}

module.exports = PlayField;
},{"../model/core.js":6,"../model/direction.js":8}],12:[function(require,module,exports){
'use strict';

let testUtility = {};
testUtility.assertStringTypeErrorText = "Value must be of type string";
testUtility.assertStringTypeValueText = "Value must not be empty";
testUtility.assertString = function(value) {
  if (typeof value !== "string") {
        throw new Error(testUtility.assertStringTypeErrorText);
  } else if (value.length === 0) {
        throw new Error(testUtility.assertStringTypeValueText);
  }
};

testUtility.assertIntegerPositiveTypeErrorText = "Value must be of type integer";
testUtility.assertIntegerPositiveValueErrorText = "Value must be greater than zero";
testUtility.assertIntegerPositive = function(value) {
    if (!Number.isInteger(value)) {
        throw new Error(testUtility.assertIntegerPositiveTypeError);
    } else if (value < 0) {
        throw new Error(testUtility.assertIntegerPositiveValueError);
    }
};

testUtility.assertIntegerGreaterThanZeroErrorText = "Value must be positive";
testUtility.assertIntegerGreaterThanZero = function(value) {
    testUtility.assertIntegerPositive(value);
    if (value === 0) {
        throw new Error(testUtility.assertIntegerGreaterThanZeroErrorText);
    }
};

testUtility.defaultValue = function(object, value) {
    return typeof object !== 'undefined' ? object : value;
};

module.exports = testUtility;
},{}],13:[function(require,module,exports){
'use strict';

class Trail {
    constructor(start, end, cellSize) {
        this.startX = start % 16;
        this.startY = Math.floor(start / 16);
        this.endX = end % 16;
        this.endY = Math.floor(end / 16);
        this.duration = 250;
        this.cycle = 250;
        this.width = Math.max(cellSize / 3, 1);
        this.descreaseFactor = Math.max(cellSize / 5, 1);
        this.isActive = true;
    }

    update(delta) {
        this.cycle -= delta;
        if (this.cycle <= 0) {
            this.width -= this.descreaseFactor;
            if (this.width < 1) {
                this.isActive = false;
            } else {
                this.cycle = this.duration;
            }
        }
    }
}

module.exports = Trail;
},{}]},{},[1])(1)
});