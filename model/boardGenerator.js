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