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
            board.goals = section.goals;
            board.area = this.boardTemplate.slice();
            for(let a = 0; a < section.walls.length; a++) {
                let wall = section.walls[a];
                for(let d = 0; d < wall[2].length; d++) {
                    let direction = wall[2][d];
                    board.area[wall[0] + wall[1] * this.boardWidth] |= Shared[direction];
                }
            }

            this.boardSections.push(board);
        }
    }

    generate() {
        let section = [];
        let boardSectionsLength = this.boardSections.length;
        for(let i = 0; i < 4; i++) {
            let b = this.boardSections[Math.floor(Math.random() * boardSectionsLength)];
            section.push(b.rotate(i));
        }

        let boardTop = [],
            boardBot = [];
        for(let i = 0; i < this.boardWidth; i++) {
            boardTop.push(...section[0].splice(0, this.boardWidth));
            boardTop.push(...section[1].splice(0, this.boardWidth));
            boardBot.push(...section[3].splice(0, this.boardWidth));
            boardBot.push(...section[2].splice(0, this.boardWidth));
        }

        let board = new Board("test", "test");
        board.area = boardTop.concat(boardBot);
        return board;
    }
}

module.exports = BoardGenerator;