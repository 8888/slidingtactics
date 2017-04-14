'use strict';

// Canvas Parameters
let canvas = document.getElementById("canvasElement");
canvas.tabIndex = 0;
canvas.focus();
let canvasWidth = canvas.width,
    canvasHeight = canvas.height,
    canvasBounds = canvas.getBoundingClientRect(),
    ctx = canvas.getContext("2d");
// Mouse
let mouseX = null,
    mouseY = null;
// Main Objects
let Game = null;
let Shared = null;

class GameLogic {
    constructor() {
        this.board = this.createBoard();
    }

    createBoard() {
        // board matrix
        // static 16x16 -> reference A1B1C1D1
        let empty = [];
        for (let i = 0; i < 16; i++) {
            let row = [];
            for (let i = 0; i < 16; i++) {
                row.push(new Space());
            }
            empty.push(row);
        }
        //A1 [0-7][0-7]
        empty[0][1].addWall(new Wall("East", Shared.EAST));
        empty[1][4].addWall(new Wall("North", Shared.NORTH));
        empty[1][4].addWall(new Wall("West", Shared.WEST));
        empty[2][1].addWall(new Wall("North", Shared.NORTH));
        empty[2][1].addWall(new Wall("East", Shared.EAST));
        empty[3][6].addWall(new Wall("South", Shared.SOUTH));
        empty[3][6].addWall(new Wall("East", Shared.EAST));
        empty[5][0].addWall(new Wall("South", Shared.SOUTH));
        empty[6][3].addWall(new Wall("South", Shared.SOUTH));
        empty[6][3].addWall(new Wall("West", Shared.WEST));
        //B1 @ 90 degrees
        empty[0][9].addWall(new Wall("East", Shared.EAST));
        empty[1][13].addWall(new Wall("East", Shared.EAST));
        empty[1][13].addWall(new Wall("North", Shared.NORTH));
        empty[3][9].addWall(new Wall("West", Shared.WEST));
        empty[3][9].addWall(new Wall("North", Shared.NORTH));
        empty[4][15].addWall(new Wall("South", Shared.SOUTH));
        empty[6][10].addWall(new Wall("East", Shared.EAST));
        empty[6][10].addWall(new Wall("South", Shared.SOUTH));
        empty[6][14].addWall(new Wall("South", Shared.SOUTH));
        empty[6][14].addWall(new Wall("West", Shared.WEST));
        //C1 @ 180 degrees
        empty[8][15].addWall(new Wall("South", Shared.SOUTH));
        empty[9][11].addWall(new Wall("South", Shared.SOUTH));
        empty[9][11].addWall(new Wall("West", Shared.WEST));
        empty[12][14].addWall(new Wall("North", Shared.NORTH));
        empty[12][14].addWall(new Wall("East", Shared.EAST));
        empty[12][9].addWall(new Wall("North", Shared.NORTH));
        empty[12][9].addWall(new Wall("West", Shared.WEST));
        empty[14][12].addWall(new Wall("East", Shared.EAST));
        empty[14][12].addWall(new Wall("South", Shared.SOUTH));
        empty[15][14].addWall(new Wall("West", Shared.WEST));        
        //D1 @ 270
        empty[9][0].addWall(new Wall("South", Shared.SOUTH));
        empty[9][4].addWall(new Wall("North", Shared.NORTH));
        empty[9][4].addWall(new Wall("East", Shared.EAST));
        empty[12][6].addWall(new Wall("East", Shared.EAST));
        empty[12][6].addWall(new Wall("South", Shared.SOUTH));
        empty[13][5].addWall(new Wall("East", Shared.EAST));
        empty[14][3].addWall(new Wall("West", Shared.WEST));
        empty[14][3].addWall(new Wall("South", Shared.SOUTH));
        empty[15][5].addWall(new Wall("West", Shared.WEST));       
        //Center
        empty[7][7].addWall(new Wall("West", Shared.WEST));
        empty[7][7].addWall(new Wall("North", Shared.NORTH));
        empty[7][8].addWall(new Wall("North", Shared.NORTH));
        empty[7][8].addWall(new Wall("East", Shared.EAST));
        empty[8][8].addWall(new Wall("East", Shared.EAST));
        empty[8][8].addWall(new Wall("South", Shared.SOUTH));
        empty[8][7].addWall(new Wall("South", Shared.SOUTH));
        empty[8][7].addWall(new Wall("West", Shared.WEST));

        return empty;
    }
}

class Wall {
    constructor(name, direction) {
        this.name = name;
        this.direction = direction;
    }
}

class Direction {
    constructor(name, value, xDelta, yDelta) {
        this.name = name;
        this.value = value;
        this.xDelta = xDelta;
        this.yDelta = yDelta;
    }
}

class SharedUtilities {
    constructor() {
        this.EAST = new Direction("East", 4, 1, 0);
        this.NORTH = new Direction("North", 1, 0, -1);
        this.WEST = new Direction("West", 8, -1, 0);
        this.SOUTH = new Direction("South", 2, 0, 1);
    }
}


class Space {
    constructor() {
        this.wallEast = null;
        this.wallNorth = null;
        this.wallWest = null;
        this.wallSouth = null;
    }

    addWall(wall) {
        // takes a Wall object
        if (wall.direction == Shared.EAST) {
            this.wallEast = wall;
        }
        else if (wall.direction == Shared.NORTH) {
            this.wallNorth = wall;
        }
        else if (wall.direction == Shared.WEST) {
            this.wallWest = wall;
        }
        else if (wall.direction == Shared.SOUTH) {
            this.wallSouth = wall;
        }
    }
}

function init() {
    Shared = new SharedUtilities();
    Game = new GameLogic();
}

function display() {
    let originX = canvasBounds.left + 50,
        originY = canvasBounds.top + 50,
        boardSize = Game.board.length,
        spaceSize = 30;

    function drawBoard() { 
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        // draw the outline
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + (boardSize * spaceSize), originY);
        ctx.lineTo(originX + (boardSize * spaceSize), originY + (boardSize * spaceSize));
        ctx.lineTo(originX, originY + (boardSize * spaceSize));
        ctx.lineTo(originX, originY);
        
        // draw each space
        for (let r = 0; r < boardSize; r++) {
            let row = Game.board[r];
            for (let s = 0; s < boardSize; s++) {
                let space = row[s];
                if (space.wallNorth) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r));
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r));
                }
                if (space.wallEast) {
                    ctx.moveTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r));
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r) + spaceSize);
                }
                if (space.wallSouth) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r) + spaceSize);
                    ctx.lineTo(originX + (spaceSize * s) + spaceSize, originY + (spaceSize * r) + spaceSize);                   
                }
                if (space.wallWest) {
                    ctx.moveTo(originX + (spaceSize * s), originY + (spaceSize * r) + spaceSize);
                    ctx.lineTo(originX + (spaceSize * s), originY + (spaceSize * r));
                }
            }
        }
        ctx.stroke();
    }



    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBoard();
}


window.onload = function() {
    init();  
    var mainloop_updateLast = performance.now();
    (function mainLoop(nowTime) {
        //update(nowTime - mainloop_updateLast);
        display();
        mainloop_updateLast = nowTime;
        requestAnimationFrame(mainLoop);
    })(performance.now());
};