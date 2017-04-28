'use strict';

let Direction = require('../model/direction.js');

class View {
    constructor(ctxBack, ctxFore, ctxVFX, spriteSheet, x, y, spaceSize) {
        this.ctxBack = ctxBack;
        this.ctxFore = ctxFore;
        this.ctxVFX = ctxVFX;
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
    }

    displayBoard(board, goalX, goalY, border) {
        this.board = board;
        let boardSize = 16,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize,
            ctx = this.ctxBack;
        ctx.lineWidth = 1;
        ctx.clearRect(x - border/2, y - border/2,
            cellWidth * 16 + border/2, cellWidth * 16 + border/2);
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
        ctx.drawImage(this.spriteSheet, 0, cellWidth * 5, cellWidth, cellWidth, goalX, goalY, cellWidth, cellWidth);
    }

    display(moveTrail, possibleMovesDirty, playerPieces, possibleMoves, clickedPiece, player) {
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
        for (let i = 0, l = moveTrail.length; i < l; i++) {
            let m = moveTrail[i];
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
        if (possibleMovesDirty.length) {
            // remove old possible moves
            for (let i = 0; i < possibleMovesDirty.length; i++) {
                let p = possibleMovesDirty[i],
                    py = Math.floor(p / boardSize),
                    px = p % boardSize;
                ctx.clearRect(x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
            possibleMovesDirty = [];
        }
        // draw the pieces
        for (let i = 0; i < playerPieces.length; i++) {
            let p = playerPieces[i];
            if (p.isDirty) {
                //p.isDirty = false;
                let pL = p.locationPrevious;
                if (pL) {
                    ctx.clearRect(x + pL.x * cellWidth, y + pL.y * cellWidth, cellWidth, cellWidth);
                    p.locationPrevious = null;
                }
                let pIndex = (clickedPiece == p ? 1 : 0) + (player == p ? 0 : 2);
                ctx.drawImage(this.spriteSheet,
                    0, cellWidth * pIndex, cellWidth, cellWidth,
                    x + (cellWidth * p.x), y + (cellWidth * p.y), cellWidth, cellWidth);
            }
        }
        if (possibleMoves.length) {
            // draw the possible moves
            for (let i = 0; i < possibleMoves.length; i++) {
                let p = possibleMoves[i],
                    py = Math.floor(p / boardSize),
                    px = p % boardSize;
                ctx.drawImage(this.spriteSheet, 0, cellWidth * 4, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
        }
    }

    displayLevelCompleteMenu(moveCount, puzzlesSolved, totalMoves) {
        let boardSize = 16,
            cellWidth = this.spaceSize,
            x = this.x + (boardSize / 4) * cellWidth,
            y = this.y,
            w = (boardSize / 2) * cellWidth;

        this.ctxVFX.beginPath();
        this.ctxVFX.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctxVFX.rect(x, y + (boardSize / 4) * cellWidth, w, w);
        this.ctxVFX.fill();
        this.ctxVFX.font = cellWidth.toString() + "px sans-serif";
        this.ctxVFX.fillStyle = "white";
        let text = moveCount + " moves!";
        this.ctxVFX.fillText(text, x + cellWidth, y + w - cellWidth);
        text = puzzlesSolved + " puzzles";
        this.ctxVFX.fillText(text, x + cellWidth, y + w + cellWidth);
        text = totalMoves + " moves!";
        this.ctxVFX.fillText(text, x + cellWidth, y + w + (cellWidth * 2));
    }

    tempClearFore() {
        this.ctxFore.clearRect(this.x, this.y, this.spaceSize * 16, this.spaceSize * 16);
    }
}

module.exports = View;