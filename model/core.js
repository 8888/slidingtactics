'use strict';

let BoardGenerator = require('../model/boardGenerator.js'),
    GamePiece = require('../model/gamePiece.js'),
    Direction = require('../model/direction.js');

let originX = 50,
    originY = 50,
    spaceSize = 30;

class GameLogic {
    constructor() {
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
        let cellX = Math.floor((x - originX) / spaceSize),
            cellY = Math.floor((y - originY) / spaceSize);
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
}

module.exports = GameLogic;