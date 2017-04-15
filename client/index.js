'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js');

// Canvas Parameters
let canvas = document.getElementById("canvasElement");
canvas.tabIndex = 0;
canvas.focus();
let canvasWidth = canvas.width,
    canvasHeight = canvas.height,
    canvasBounds = canvas.getBoundingClientRect(),
    ctx = canvas.getContext("2d"),
    originX = 50,
    originY = 50;
// Mouse
let mouseX = null,
    mouseY = null;

// Main Constants
let gameInstances = [];
let gamesWidth = 6,
    gamesHeight = 3,
    gamesBorder = 10,
    cellSpace = null;
function init() {
    
    let cellSpaceX = (canvasWidth / gamesWidth - gamesBorder * 2) / 16,
        cellSpaceY = (canvasHeight / gamesHeight - gamesBorder * 2) / 16;
    cellSpace = Math.min(cellSpaceX, cellSpaceY);

    for(let x = 0; x < gamesWidth; x++) {
        for(let y = 0; y < gamesHeight; y++) {
            let g = new GameLogic(
                (gamesBorder + cellSpace * 16) * x + gamesBorder,
                gamesBorder + (gamesBorder + cellSpace * 16) * y,
                cellSpace);
            gameInstances.push(g);
        }
    }
}

let commands = [],
    commandDetla = 0,
    commandDelay = 250,
    devAutoCommandEnabled = true,
    devSelect2Text = {};
devSelect2Text[0] = '2673';
devSelect2Text[1] = '2674';
devSelect2Text[2] = '2675';
devSelect2Text[3] = '2676';
function update(delta) {
    for(let i = 0; i < gameInstances.length; i++) {
        gameInstances[i].update(delta);
    }

    commandDetla += delta;
    if (commandDetla > commandDelay && devAutoCommandEnabled) {
        commandDetla = 0;
        let roll = Math.random();
        let c = null;
        if (roll < 0.85 && commands.length) {
            c = Direction.ALL[Math.floor(Math.random() * Direction.ALL.length)];
            commands.push(Direction.unicode[c]);
            for(let i = 0; i < gameInstances.length; i++) {
                gameInstances[i].onDirection(c);
            }
        } else {
            c = Math.floor(Math.random() * 4);
            commands.push(devSelect2Text[c]);
            for(let i = 0; i < gameInstances.length; i++) {
                gameInstances[i].onDevSelect(c);
            }
        }

        if (commands.length > 20) {
            commands.shift();
        }
    }
}

function display() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for(let i = 0; i < gameInstances.length; i++) {
        gameInstances[i].display(ctx);
    }

    if (commands.length) {
        ctx.fillText('Press "p" to toggle auto commands', gamesBorder, canvasHeight - 50);
        ctx.font = "48px sans-serif";
        for(let i = 0, l = commands.length; i < l; i++) {
            let c = commands[i];
            ctx.fillStyle = i == l - 1 ? 'red' : 'black';
            ctx.fillText(String.fromCharCode(parseInt(c, 16)), gamesBorder + 48 * (l - i), canvasHeight - 10);
        }
        ctx.font = "10px sans-serif";
    }
}

let LEFT_MOUSE_CLICK = 0;
canvas.addEventListener("mousedown", function(event) {
    if (event.button === LEFT_MOUSE_CLICK) {
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onMouse1Down(mouseX, mouseY);
        }
    }
});

canvas.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - canvasBounds.left;
    mouseY = event.clientY - canvasBounds.top;
});

canvas.addEventListener("mouseup", function(event) {
    if (event.button === LEFT_MOUSE_CLICK) {
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onMouse1Up(mouseX, mouseY);
        }
    }
});

canvas.addEventListener("keydown", function(event) {
    let direction = null;
    let devSelect = null;

    if (event.key === "ArrowLeft") {
        direction = Direction.W;
    } else if (event.key === "ArrowUp") {
        direction = Direction.N;
    } else if (event.key === "ArrowRight") {
        direction = Direction.E;
    } else if (event.key === "ArrowDown") {
        direction = Direction.S;
    } else if (event.key === "1") {
        devSelect = 0;
    } else if (event.key === "2") {
        devSelect = 1;
    } else if (event.key === "3") {
        devSelect = 2;
    } else if (event.key === "4") {
        devSelect = 3;
    } else if (event.key == "p") {
        devAutoCommandEnabled = !devAutoCommandEnabled;
    }

    if (direction) {
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onDirection(direction);
        }
    }

    if (devSelect !== null) {
        for(let i = 0; i < gameInstances.length; i++) {
            gameInstances[i].onDevSelect(devSelect);
        }
    }
});

window.onload = function() {
    init();
    var mainloop_updateLast = performance.now();
    (function mainLoop(nowTime) {
        update(nowTime - mainloop_updateLast);
        display();
        mainloop_updateLast = nowTime;
        requestAnimationFrame(mainLoop);
    })(performance.now());
};