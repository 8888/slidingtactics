'use strict';

let GameLogic = require('../model/core.js'),
    Direction = require('../model/direction.js'),
    View = require('../model/view.js'),
    SeedGenerator = require('../model/seedGeneratorDatabase.js'),
    SeedGeneratorGuest = require('../model/seedGeneratorLocal.js'),
    AJAX = require('../model/ajax.js');

class PlayField {
    constructor(containerElementId, is_guest) {
        this.container = document.getElementById(containerElementId);
        this.canvasWidth = 1280;
        this.canvasHeight = 720;
        this.canvasSprite = this.canvasCreate('spriteCanvas', 0, true);
        this.canvasBack = this.canvasCreate('backCanvas', 1, false, 'Lavender');
        this.ctxBack = this.canvasBack.getContext('2d');
        this.canvasAnimation = this.canvasCreate('effectCanvas', 2);
        this.ctxVFX = this.canvasAnimation.getContext('2d');
        this.canvasActors = this.canvasCreate('pieceCanvas', 3);
        this.ctxFore = this.canvasActors.getContext('2d');
        this.canvasControls = this.canvasCreate('controlsCanvas', 4);
        this.ctxControls = this.canvasControls.getContext('2d');
        this.gameInstances = [];
        this.games = {
            width: 1,
            height: 1,
            border: 10,
            cellSpace: null,
            deltaTotal: 0,
            countTotal: 0,
            countSolved: 0,
            countMoves: 0
        };
        this.boardSize = 16;
        this.is_guest = parseInt(is_guest);
        this.seedGenerator = this.is_guest ? new SeedGeneratorGuest() : new SeedGenerator();
        this.seedGenerator.isRanked = location.search.indexOf('practice') === -1;
        this.view = View;
        this.buttons = [];
    }

    canvasCreate(id, zIndex, isHidden, backgroundColor) {
        let canvas = document.createElement('CANVAS');
        canvas.id = this.container.id + '_' + id;
        canvas.style = 'z-index: '+zIndex+';';
        canvas.setAttribute('class', 'cnvs');
        canvas.setAttribute('width', this.canvasWidth);
        canvas.setAttribute('height', this.canvasHeight);
        canvas.oncontextmenu = 'return false;';
        if (isHidden) {
            canvas.style.display = 'none';
        }
        if (backgroundColor) {
            canvas.style.background = backgroundColor;
        }
        
        this.container.appendChild(canvas);
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

    init(onGameNewCallback, onGameOverCallback, onMoveCallback, onUndoCallback, onRestartCallback) {
        let that = this;
        onGameOverCallback || (onGameOverCallback = function(g) {
            that.games.countSolved++;
            that.games.countMoves += g.moveCount;
            if(!that.is_guest) {
                let puzzleUpdate = AJAX.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=update',
                    'key='+g.puzzle_instance_key+'&s=1&m='+g.moveCount);
            }
            if (g.isFinalPuzzle) {
                localStorage.setItem("sessionLast_solved", that.games.countSolved);
                localStorage.setItem("sessionLast_moves", that.games.countMoves);
                window.location = 'index.html';
            }
        });
        onMoveCallback || (onMoveCallback = function(key, move, piece, direction, start, end) {
            if (!that.is_guest) {
                let moveUpdate = AJAX.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=addMove',
                    'key='+key+'&m='+move+'&p='+piece+'&d='+direction+'&s='+start+'&e='+end);
                moveUpdate.then((d) => {
                    this.moveHistory[this.moveHistory.length-1].key = d.puzzle_user_move_key;
                });
            }
        });
        onUndoCallback || (onUndoCallback = function(key) {
            if (!that.is_guest) {
                let undoUpdate = AJAX.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=undoMove',
                    'key='+key);
            }
        });
        onRestartCallback || (onRestartCallback = function(key) {
            if (!that.is_guest) {
                let restartUpdate = AJAX.promise_post('https://tactics.prototypeholdings.com/x/puzzle.php?action=restartPuzzle',
                    'key='+key);
            }
        });
        this.gameInstances = [];
        this.games.border = this.games.width * this.games.height > 500 ? 2 : 10;
        let cellSpaceX = (this.canvasWidth / this.games.width - this.games.border * 2) / this.boardSize,
            cellSpaceY = (this.canvasHeight / this.games.height - this.games.border * 2) / this.boardSize;
        this.games.cellSpace = Math.floor(Math.max(Math.min(cellSpaceX, cellSpaceY), 1));
        this.games.deltaTotal = 0;
        this.games.countTotal = 0;
        this.games.countSolved = 0;
        this.games.countMoves = 0;
        this.ctxFore.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxVFX.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxBack.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctxControls.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        let ctxSprite = this.canvasSprite.getContext('2d');
        ctxSprite.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.createButtons();
        this.createSprites(ctxSprite);
        this.displayButtons(this.ctxControls, this.canvasSprite);
        for(let w = 0; w < this.games.width; w++) {
            for(let h = 0; h < this.games.height; h++) {
                let x = (this.games.border + this.games.cellSpace * this.boardSize) * w + this.games.border,
                    y = this.games.border + (this.games.border + this.games.cellSpace * this.boardSize) * h;
                let v = this.view ? new this.view(
                    this.ctxBack, this.ctxFore, this.ctxVFX, this.canvasSprite,
                    x, y, this.games.cellSpace, this.games.border, this.boardSize)
                    : null;
                let g = new GameLogic(
                    v, this.seedGenerator,
                    x, y, this.games.cellSpace, this.boardSize,
                    onGameNewCallback, onGameOverCallback, onMoveCallback, onUndoCallback, onRestartCallback);
                this.gameInstances.push(g);
            }
        }
    }

    eventListenersAttach() {
        let that = this;
        let LEFT_MOUSE_CLICK = 0;
        window.addEventListener("mousedown", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Down(event.layerX, event.layerY);
                }
                // TODO: remove 0 index, buttons only for mouse over selected puzzle
                if (that.buttons.length) {
                    for (let b = 0; b < that.buttons.length; b++) {
                        let button = that.buttons[b];
                        if (button.x < event.layerX && event.layerX <= button.x + button.width &&
                            button.y < event.layerY && event.layerY <= button.y + button.height
                        ) {
                            that.gameInstances[0].onKeyDown(button.key);
                            if (button.key == "f") {
                                that.toggleFinalPuzzle(that.gameInstances[0], that.ctxControls, button, that.canvasSprite);
                            }
                        }
                    }
                }
            }
        });

        window.addEventListener("mouseup", function(event) {
            if (event.button === LEFT_MOUSE_CLICK) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onMouse1Up(event.layerX, event.layerY);
                }
            }
        });

        window.addEventListener("keydown", function(event) {
            let direction = Direction.byEventKey[event.key];
            if (direction) {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onDirection(direction);
                }
            } else {
                for(let i = 0; i < that.gameInstances.length; i++) {
                    that.gameInstances[i].onKeyDown(event.key);
                }
            }
        });
    }

    update(delta) {
        this.games.deltaTotal += delta;
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].update(delta);
        }
    }

    display() {
        for(let i = 0; i < this.gameInstances.length; i++) {
            this.gameInstances[i].display();
        }
    }

    createSprites(ctx) {
        let s = this.games.cellSpace,
            r = s*0.9,
            origin = 0;
        // player pieces
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let color = i < 2 ? '#ff0000' : '#0000ff';
            let x = s / 2,
                y = origin + (s / 2);
            let gradient = ctx.createRadialGradient(x+s/5,y-s/5,0, x,y, this.games.cellSpace);
            gradient.addColorStop(0,"white");
            gradient.addColorStop(0.8, color);
            gradient.addColorStop(0.98, color);
            gradient.addColorStop(1,"white");
            ctx.fillStyle = gradient;
            ctx.arc(x, y, s * 0.46, 0, 2 * Math.PI);
            ctx.fill();
            if (i == 1 || i == 3) {
                ctx.beginPath();
                ctx.lineWidth = s * 0.1;
                ctx.strokeStyle = '#ffff00';
                ctx.arc(
                    x,
                    y,
                    s / 2 - ctx.lineWidth / 2, 0, 2 * Math.PI
                );
                ctx.stroke();
            }
            origin += s;
        }

        // possible moves
        ctx.beginPath();
        ctx.lineWidth = s * 0.1;
        ctx.strokeStyle = '#ffff00';
        ctx.arc(
            s / 2,
            origin + (s / 2),
            this.games.cellSpace / 2 - ctx.lineWidth / 2, 0, 2 * Math.PI
        );
        ctx.stroke();
        origin += s;

        // goal
        ctx.fillStyle = '#f442f1';
        ctx.fillRect(
            s * 0.1,
            (s * 0.1) + origin,
            s * 0.8,
            s * 0.8
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(
                s / 2, s / 2 + origin,
                (s*0.46)/5 * (i+1), 0, Math.PI * 2, true);
            ctx.fill();
        }
        origin += s;

        // buttons
        for (let b = 0; b < this.buttons.length; b++) {
            let button = this.buttons[b];
            this.drawButton(ctx, button, 0, origin, "black");
            if (button.name == 'final puzzle') {
                this.drawButton(ctx, button, button.width, origin, "green");
            }
            origin += button.height;
        }
    }

    createButtons() {
        let s = this.games.cellSpace,
            x = this.games.border * 2 + s * this.boardSize,
            y = this.games.border,
            gap = 1.5 * s,
            names = ['undo', 'new game', 'restart', 'final puzzle'],
            keys = ['u', 'n', 'r', 'f'];
        this.buttons = [];
        for (let i = 0; i < 4; i++) {
            let button = {
                "name": names[i],
                "key": keys[i],
                "x" : x,
                "y" : y + (gap * i),
                "width" : s * 4,
                "height" : s
            };
            this.buttons.push(button);
        }
    }

    drawButton(ctx, button, x, y, textColor) {
        ctx.beginPath();
        let gradient = ctx.createLinearGradient(x, y, x, y + button.height);
        gradient.addColorStop(0,"sandybrown");
        gradient.addColorStop(0.2, "sandybrown");
        gradient.addColorStop(1,"silver");
        ctx.fillStyle = gradient;
        ctx.rect(x, y, button.width, button.height);
        ctx.fill();
        ctx.fillStyle = textColor;
        let fontSize = button.height * 0.6;
        ctx.font = fontSize + "px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let text = button.name;
        ctx.fillText(text, x + button.width / 2, y + button.height / 2);
    }

    displayButtons(ctx, spriteSheet) {
        for (let b = 0; b < this.buttons.length; b++) {
            let button = this.buttons[b];
            ctx.drawImage(spriteSheet,
                0, button.height * (6 + b), button.width, button.height,
                button.x, button.y, button.width, button.height);
        } // (6 + b) is the x based off how many sprites on the sheet, this shouldn't be hardcoded
    }

    toggleFinalPuzzle(game, ctx, button, spriteSheet) {
        ctx.clearRect(button.x, button.y, button.width, button.height);
        let x = 0;
        if (game.isFinalPuzzle) {
            x = button.width;
        }
        ctx.drawImage(spriteSheet,
            x, button.height * 9, button.width, button.height,
            button.x, button.y, button.width, button.height);
    } // hardcoded 9 is order on spritesheet
}

module.exports = PlayField;