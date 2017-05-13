'use strict';

let Direction = require('../model/direction.js');

class View {
    constructor(ctxBack, ctxFore, ctxVFX, spriteSheet, x, y, spaceSize, border, boardSize) {
        this.ctxBack = ctxBack;
        this.ctxFore = ctxFore;
        this.ctxVFX = ctxVFX;
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.spaceSize = spaceSize;
        this.border = border;
        this.boardSize = boardSize;
    }

    displayBoard(board, goalX, goalY) {
        this.levelComplete = false;
        let x = this.x,
            y = this.y,
            cellWidth = this.spaceSize,
            ctx = this.ctxBack;
        ctx.lineWidth = 1;
        ctx.clearRect(x - this.border/2, y - this.border/2,
            cellWidth * this.boardSize + this.border/2, cellWidth * this.boardSize + this.border/2);
        this.ctxFore.clearRect(this.x, this.y, this.spaceSize * this.boardSize, this.spaceSize * this.boardSize);
        // grid
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        for (let i = 1; i < this.boardSize; i++) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(136, 136, 136, 0.4)';
            ctx.moveTo(x + (cellWidth * i), y);
            ctx.lineTo(x + (cellWidth * i), y + (this.boardSize * cellWidth));
            ctx.moveTo(x, y + (cellWidth * i));
            ctx.lineTo(x + (this.boardSize * cellWidth), y + (cellWidth * i));
        }
        ctx.stroke();
        // all goal options
        ctx.strokeStyle = 'rgba(244, 66, 241, 0.5)';
        for(let i = 0; i < board.goals.length; i++) {
            let g = board.goals[i];
            let gX = g % this.boardSize,
                gY = Math.floor(g / this.boardSize);
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
        ctx.lineWidth = this.spaceSize < this.boardSize*3 ? 1 : 2;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(x, y, (this.boardSize * cellWidth), (this.boardSize * cellWidth));
        // draw each space
        ctx.lineCap = 'round';
        for (let r = 0; r < this.boardSize; r++) {
            for (let s = 0; s < this.boardSize; s++) {
                let space = board.item(r * this.boardSize + s);
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
        let ctx = this.ctxFore,
            x = this.x,
            y = this.y,
            cellWidth = this.spaceSize;

        this.ctxVFX.clearRect(x, y, cellWidth * this.boardSize, cellWidth * this.boardSize);
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
                    py = Math.floor(p / this.boardSize),
                    px = p % this.boardSize;
                ctx.clearRect(x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
        }
        // draw the pieces
        for (let i = 0; i < playerPieces.length; i++) {
            let p = playerPieces[i];
            if (p.isDirty) {
                p.isDirty = false;
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
                    py = Math.floor(p / this.boardSize),
                    px = p % this.boardSize;
                ctx.drawImage(this.spriteSheet, 0, cellWidth * 4, cellWidth, cellWidth, x + (cellWidth * px), y + (cellWidth * py), cellWidth, cellWidth);
            }
        }
    }

    displayLevelCompleteMenu(moveCount, puzzlesSolved, totalMoves) {
        this.levelComplete = true;
        let cellWidth = this.spaceSize,
            x = this.x + (this.boardSize / 4) * cellWidth,
            y = this.y,
            w = (this.boardSize / 2) * cellWidth;

        this.ctxFore.beginPath();
        this.ctxFore.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctxFore.rect(x, y + (this.boardSize / 4) * cellWidth, w, w);
        this.ctxFore.fill();
        this.ctxFore.font = cellWidth.toString() + "px sans-serif";
        this.ctxFore.fillStyle = "white";
        let text = moveCount + " moves!";
        this.ctxFore.fillText(text, x + cellWidth, y + w - cellWidth);
        text = puzzlesSolved + " puzzles";
        this.ctxFore.fillText(text, x + cellWidth, y + w + cellWidth);
        text = totalMoves + " moves!";
        this.ctxFore.fillText(text, x + cellWidth, y + w + (cellWidth * 2));
    }
}

module.exports = View;