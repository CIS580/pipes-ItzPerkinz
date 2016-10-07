(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes */
const Game = require('./game');
const Pipe = require('./pipe');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var image = new Image();
image.src = 'assets/pipes.png';

var level = 1;                                              // Keeps track of the player's level. Used to increase difficulty.
var timer = 0;                                              // A timer that keeps track of the time since the last upcomingPipe addition
var temp;                                                   // A temporary variable used throughout the game.
var randNum;                                                // A random number that is used when choosing the next upcoming pipe.
var upcomingPipes = new Array();                            // The list of upcoming pipes that the player can place
var pipes = new Array();                                    // The list of pipes on the board
var eventX;                                                 // The X cell of the mouse click
var eventY;                                                 // The Y cell of the mouse click
var rect;                                                   // A variable used in the mouse click event to get the bounds of the canvas
var start;                                                  // The starting pipe
var end;                                                    // The ending pipe
var connectedPipes = new Array();                           // The list of pipes that are indirectly connected to the starting pipe
var waterWay = new Array();                                 // The list of pipes that the water will go through
var watertimer = 57000;                                     // The intial timer until the water starts flowing
var gameOver = false;                                       // Checks if the game is over
var flowing = false;                                        // Checks if the water is flowing
var backgroundSong = new Audio("assets/Slow Pipes.mp3");    // The background song
  backgroundSong.loop = true;
  backgroundSong.volume = 0.1;
  backgroundSong.play();
var rotate = new Audio("assets/Rotate.wav");                // Rotate sound
  rotate.volume = 0.2;
var win = new Audio("assets/Win.wav");                      // Win sound
  win.volume = 0.2;
var lose = new Audio("assets/Lose.wav");                    // Lose sound
  lose.volume = 0.6;
var place = new Audio("assets/Place.wav");                  // Place sound
  place.volume = 0.1;

// Initialize board with slots with no pipe attached
var board = new Array();
for (var i = 0; i<195; i++)
{
  var slot = { pipe: null };
  board[i] = slot;
}


// Initialize pipes
var listofpipes = new Array();                              // The list of possible pipes to pull from
var upLarge = [1,5,10,11,12,15,18,19];                      // The list of pipe.num that will have their up value = "large"
var upSmall = [9,13];                                       // The list of pipe.num that will have their up value = "small"
var rightLarge = [1,4,6,8,10,14,18,19];                     // The list of pipe.num that will have their right value = "large"
var rightSmall = [2,3];                                     // The list of pipe.num that will have their right value = "small"
var leftLarge = [1,2,7,8,11,14,15,19];                      // The list of pipe.num that will have their left value = "large"
var leftSmall = [3,4];                                      // The list of pipe.num that will have their left value = "small"
var downLarge = [1,6,7,12,13,14,15,18];                     // The list of pipe.num that will have their down value = "large"
var downSmall = [5,9];                                      // The list of pipe.num that will have their down value = "small"

// Adds all 17 pipes to the list of possible pipes
for (var x = 1; x <= 19; x++)
{
  if (x != 16 && x != 17)
  {
    var pipe = new Pipe(x, 0, 0);
    listofpipes.push(pipe);
  }
}

// Chooses a random pipe for the starting and ending pipes
function chooseStartAndEnd()
{
  // Start
  var rand1 = Math.floor(Math.random()*17);
  temp = clonePipe(listofpipes[rand1]);
  temp.start = true;
  temp.x = Math.floor(Math.random()*2+2);
  temp.y = Math.floor(Math.random()*11+1);
  board[((temp.x-1)+temp.y*15)].pipe = temp;
  pipes.push(temp);
  connectedPipes.push(temp);
  start = temp;

  // End
  var rand2 = Math.floor(Math.random()*17);
  temp = clonePipe(listofpipes[rand2]);
  temp.end = true;
  temp.x = Math.floor(Math.random()*2+13);
  temp.y = Math.floor(Math.random()*11+1);
  board[((temp.x-1)+temp.y*15)].pipe = temp;
  pipes.push(temp);
  end = temp;
  updateWaterWay(connectedPipes);
}

chooseStartAndEnd();

// Left click
canvas.onclick = function(event) {
  event.preventDefault();
  if (gameOver != true)
  {
    // From -- http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
      rect = canvas.getBoundingClientRect();
      eventX = event.clientX - rect.left;
      eventY = event.clientY - rect.top;
    // Determine cell
    var cellX = Math.floor(eventX/64);
    var cellY = Math.floor(eventY/64);
    var boardSlot = ((cellX-1)+cellY*15);
    // TODO: Place or rotate pipe tile
    if (board[boardSlot].pipe == null && cellX > 0 && cellX < 16 && cellY < 14 && cellY >= 0)
      {
        place.play();
        var temp1 = upcomingPipes[0];
        temp1.x = cellX; temp1.y = cellY;
        temp1.distanceFromRoot = 1000;
        pipes.push(temp1);
        upcomingPipes.shift();
        board[boardSlot].pipe = temp1;
        connect(temp1);
      }
    updateWaterWay(connectedPipes);
    checkForWin();
  }
}

// Right click
canvas.oncontextmenu = function(event)
{

  event.preventDefault();
  if (gameOver != true)
  {
    rect = canvas.getBoundingClientRect();
    eventX = event.clientX - rect.left;
    eventY = event.clientY - rect.top;
    var cellX = Math.floor(eventX/64);
    var cellY = Math.floor(eventY/64);
    var boardSlot = ((cellX-1)+cellY*15);

    if (board[boardSlot].pipe != null && board[boardSlot].pipe.start == false && board[boardSlot].pipe.end == false && board[boardSlot].filled != true)
    {

      // creating a new pipe that is the rotated version of the previous one
      var temp2 = board[boardSlot].pipe;
      var newPipe = rotatePipe(temp2);
      newPipe.distanceFromRoot = 1000;

      // cut connections and update the connectedPipes list
      cutConnections(temp2);

      // place in new pipe
      var index = pipes.indexOf(temp2);
      pipes[index] = newPipe;
      connect(newPipe);
      board[boardSlot].pipe = newPipe;
      updateWaterWay(connectedPipes);
      rotate.play();
      checkForWin();
  }

  }

}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  // Updates the list of upcomingPipes.
  if (gameOver != true)
  {
    timer = timer + elapsedTime;
    watertimer = watertimer - elapsedTime;
    if (watertimer <= 0 && flowing == false) { flowing = true; }
    // advances fluid
    if (timer >= 3500/(1 + level*.1-.1))
    {
      if (flowing == true) { fillNextPipe(); }
      // Creates more upcoming pipes
      randNum = Math.floor(Math.random()*17);
      temp = clonePipe(listofpipes[randNum]);
      upcomingPipes.push(temp);
      if (upcomingPipes.length > 8) { upcomingPipes.shift(); }
      timer = 1;
    }
  }
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "#777777";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "Black";
  // TODO: Render the board
  // Draws the grid. Can change the 32 number to change size to 64.
  for (var x = 0; x <= (canvas.width)/64; x++)
  {
    ctx.fillRect(x*64, 0, 1.5, 832);
  }
  for (var y = 0; y <= (canvas.height)/64; y++)
  {
    ctx.fillRect(64, y*64, canvas.width, 1.5);
  }
  // Draws the level and water counter
  ctx.fillRect(0, 512, 64, 5);
  ctx.font = "20px Impact";
  ctx.fillText("Level = ", 5, 539);
  ctx.fillText(level, 25, 564);
  ctx.font = "15px Impact";
  ctx.fillText("WATER IN", 5, 603);
  var t = watertimer/1000 + 3;
  var rounded = Math.round(t*10/10);
  if (rounded < 0 ) { rounded = 0; }
  ctx.font = "20px Impact";
  ctx.fillText(rounded, 20, 630);


  // Draws the list of upcoming pipes
  for (var u = 0; u < upcomingPipes.length; u++)
  {
    var currentPipe = upcomingPipes[u];
    ctx.drawImage(currentPipe.image, currentPipe.imageX, currentPipe.imageY, 31, 31, 0, (upcomingPipes.length-u)*64-64, 64, 64);
  }

  // Draws the list of pipes on the board
  for (var u2 = 0; u2 < pipes.length; u2++)
  {
    var currentPipe2 = pipes[u2];
    if (currentPipe2.start) { ctx.fillStyle = "Green"; ctx.fillRect(currentPipe2.x*64+2, currentPipe2.y*64+2, 62, 62); }
    if (currentPipe2.end) { ctx.fillStyle = "Red"; ctx.fillRect(currentPipe2.x*64+2, currentPipe2.y*64+2, 62, 62);}
    ctx.drawImage(currentPipe2.image, currentPipe2.imageX, currentPipe2.imageY, 31, 31, currentPipe2.x*64, currentPipe2.y*64, 64, 64);
  }

  // Draws game over screen
  if (gameOver == true)
  {
    ctx.font = "30px Impact";
    ctx.fillStyle = "White";
    ctx.fillText("GAME OVER -- REACHED LEVEL " + level, 365, 300);
  }
}


// clones a pipe
function clonePipe(pipe)
{
  var temp = new Pipe(pipe.num, pipe.x, pipe.y);
  return temp;
}

// looks for connections around a pipe on the grid and adds it to the list of connected pipes if need be
function connect(pipe)
{
  pipe.connected = new Array();
  var up = -1;
  var down = -1;
  var right = -1;
  var left = -1;

  // check to make sure the pipe is not an edge pipe
  if (pipe.y != 0) { up = (pipe.x - 1) + (pipe.y * 15) - 15; }
  if (pipe.y != 12) { down = (pipe.x - 1) + (pipe.y * 15) + 15; }
  if (pipe.x != 14) { right = (pipe.x - 1) + (pipe.y * 15) + 1; }
  if (pipe.x != 0) { left = (pipe.x - 1) + (pipe.y * 15) - 1; }

  // look for connections to close pipes
  if (up != -1 && board[up].pipe != null)
  {
    // pipe has a connection above it that is included in connectedPipes
    if (pipe.up == board[up].pipe.down && pipe.up != "none") {
      // connected pipe is also in the connectedPipes main list
      if (connectedPipes.includes(board[up].pipe))
      {

        if (connectedPipes.includes(pipe) != true) { connectedPipes.push(pipe); }
      }
      board[up].pipe.connected.push(pipe);
      pipe.connected.push(board[up].pipe);
    }
  }
  if (right != -1 && board[right].pipe != null)
  {
    // pipe has a connection to the right
    if (pipe.right == board[right].pipe.left && pipe.right != "none") {
      // connected pipe is also in the connectedPipes main list
      if (connectedPipes.includes(board[right].pipe))
      {

        if (connectedPipes.includes(pipe) != true) { connectedPipes.push(pipe); }
      }
      board[right].pipe.connected.push(pipe);
      pipe.connected.push(board[right].pipe);

    }
  }
  if (left != -1 && board[left].pipe != null)
  {
    // pipe has a connection to the left that
    if (pipe.left == board[left].pipe.right && pipe.left != "none") {
      // connected pipe is also in the connectedPipes main list
      if (connectedPipes.includes(board[left].pipe))
      {
        if (connectedPipes.includes(pipe) != true) { connectedPipes.push(pipe); }
      }
      board[left].pipe.connected.push(pipe);
      pipe.connected.push(board[left].pipe);
    }
  }
  if (down != -1 && board[down].pipe != null)
  {
    // pipe has a connection downward that is included in connectedPipes
    if (pipe.down == board[down].pipe.up && pipe.down != "none") {
      // connected pipe is also in the connectedPipes main list
      if (connectedPipes.includes(board[down].pipe))
      {

        if (connectedPipes.includes(pipe) != true) { connectedPipes.push(pipe); }
      }
      board[down].pipe.connected.push(pipe);
      pipe.connected.push(board[down].pipe);
    }
  }
  if (connectedPipes.includes(pipe))
  {
    for (var i = 0; i < pipe.connected.length; i++)
    {
      pipe.distanceFromRoot = Math.min(pipe.distanceFromRoot, pipe.connected[i].distanceFromRoot);
    }
    pipe.distanceFromRoot++;
    expandCP(pipe);
  }
}

// Updates the water way from the root
function updateWaterWay(cP)
{
  waterWay = new Array();
  var max = 0;
  var index = 0;
  for (var i = 0; i < cP.length; i++)
  {
    if (cP[i].distanceFromRoot > max)
    {
      index = i;
      max = cP[i].distanceFromRoot;
    }
  }
  waterWay.push(cP[index]);
  returnPath(cP[index]);
}

// Returns the patch to the root
function returnPath(pipe)
{
  for (var i = 0; i < pipe.connected.length; i++)
  {
    if (pipe.connected[i].distanceFromRoot < pipe.distanceFromRoot)
    {
      waterWay.push(pipe.connected[i]);
      if (pipe.connected[i].distanceFromRoot != 0) { returnPath(pipe.connected[i]); }
    }
  }
}

// Removes an element from an Array
function removeElement(a, remove)
{
  var index = a.indexOf(remove);
  var temp = a[0];
  a[0] = remove;
  a[index] = temp;
  a.shift();
}

// should theoretically take a pipe and cut all pipes that branch out from this pipe away from the connectedPipes list.
function cutConnections(pipe)
{
  if (connectedPipes.includes(pipe)) { removeElement(connectedPipes, pipe); }
  for (var i =0; i < pipe.connected.length; i++)
  {
    removeElement(pipe.connected[i].connected, pipe);
  }
  pipe.connected = new Array();
  var root = findRoot(connectedPipes);
  connectedPipes = new Array();
  connectedPipes.push(root);
  expandCP(root);
}

// expands the connectedPipes list from the root
function expandCP(root)
{
  for (var i = 0; i < root.connected.length; i++)
  {
    if (connectedPipes.includes(root.connected[i]) != true)
    {
      root.connected[i].distanceFromRoot = root.distanceFromRoot + 1;
      connectedPipes.push(root.connected[i]);
      expandCP(root.connected[i]);
    }
  }
}

// Fills the next pipe in waterWay
function fillNextPipe()
{
  for (var i = waterWay.length-1; i >= 0; i--)
  {
    if (waterWay[i].filled != true) {
      waterWay[i].image.src = "assets/filledPipes.png";
      waterWay[i].filled = true;
      checkForLoss();
      return;
    }
  }
}

// Checks to see if you have lost the level....
function checkForLoss()
{
  if (waterWay[0].filled == true)
  {
    gameOver = true;
    lose.play();
  }
}

// Checks to see if you have beaten the level!
function checkForWin()
{
  if (connectedPipes.includes(end))
  {
      level++;
      timer = 1;
      upcomingPipes = new Array();
      pipes = new Array();
      connectedPipes = new Array();
      for (var i = 0; i < 195; i++) { board[i].pipe = null; }
      watertimer = 57000 - 5000*level;
      if (watertimer < 20000) { watertimer = 20000; }
      flowing = false;
      win.play();
      chooseStartAndEnd();
  }
}

// Finds the root of the connectedPipes list. This is used to update the list and determine the proper waterWay
function findRoot(cP)
{
  for (var i = 0; i<cP.length; i++)
  {
    if (cP[i].distanceFromRoot == 0) { return cP[i]; }
  }
}

// rotates the pipe 90 degrees clockwise (really replaces the pipe with a different one.. but w/e)
function rotatePipe(pipe)
{
  var temp;
  switch (pipe.num)
  {
    case 1:
      temp = pipe;
      return temp;
    break;
    case 2:
      temp = new Pipe(5, pipe.x, pipe.y);
      return temp;
    break;
    case 3:
      temp = new Pipe(9, pipe.x, pipe.y);
      return temp;
    break;
    case 4:
      temp = new Pipe(13, pipe.x, pipe.y);
      return temp;
    break;
    case 5:
      temp = new Pipe(4, pipe.x, pipe.y);
      return temp;
    break;
    case 6:
      temp = new Pipe(7, pipe.x, pipe.y);
      return temp;
    break;
    case 7:
      temp = new Pipe(11, pipe.x, pipe.y);
      return temp;
    break;
    case 8:
      temp = new Pipe(12, pipe.x, pipe.y);
      return temp;
    break;
    case 9:
      temp = new Pipe(3, pipe.x, pipe.y);
      return temp;
    break;
    case 10:
      temp = new Pipe(6, pipe.x, pipe.y);
      return temp;
    break;
    case 11:
      temp = new Pipe(10, pipe.x, pipe.y);
      return temp;
    break;
    case 12:
      temp = new Pipe(8, pipe.x, pipe.y);
      return temp;
    break;
    case 13:
      temp = new Pipe(2, pipe.x, pipe.y);
      return temp;
    break;
    case 14:
      temp = new Pipe(15, pipe.x, pipe.y);
      return temp;
    break;
    case 15:
      temp = new Pipe(19, pipe.x, pipe.y);
      return temp;
    break;
    case 18:
      temp = new Pipe(14, pipe.x, pipe.y);
      return temp;
    break;
    case 19:
      temp = new Pipe(18, pipe.x, pipe.y);
      return temp;
    break;
  }

}

},{"./game":2,"./pipe":3}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],3:[function(require,module,exports){
"use strict";

module.exports = exports = Pipe;
var upLarge = [1,5,10,11,12,15,18,19];
var upSmall = [9,13];
var rightLarge = [1,4,6,8,10,14,18,19];
var rightSmall = [2,3];
var leftLarge = [1,2,7,8,11,14,15,19];
var leftSmall = [3,4];
var downLarge = [1,6,7,12,13,14,15,18];
var downSmall = [5,9];


function Pipe(number, X, Y)
{
  this.num = number;
  this.up = "none";
  this.down = "none";
  this.right = "none";
  this.left = "none";
  this.connected = new Array();
  this.connections = 0;
  this.filled = false;
  this.cell = null;
  this.x = X;
  this.y = Y;
  this.image = new Image();
  this.image.src = "assets/pipes.png";
  this.start = false;
  this.end = false;
  this.distanceFromRoot = 0;

  if (upLarge.includes(this.num)) {this.up = "large";}
  if (downLarge.includes(this.num)) {this.down = "large";}
  if (rightLarge.includes(this.num)) {this.right = "large";}
  if (leftLarge.includes(this.num)) {this.left = "large";}
  if (upSmall.includes(this.num)) {this.up = "small";}
  if (downSmall.includes(this.num)) {this.down = "small";}
  if (rightSmall.includes(this.num)) {this.right = "small";}
  if (leftSmall.includes(this.num)) {this.left = "small";}

  switch (this.num)
  {
    case 1:
    case 2:
    case 3:
    case 4:
      this.imageY = 0;
      break;
    case 5:
    case 6:
    case 7:
    case 8:
      this.imageY = 32;
      break;
    case 9:
    case 10:
    case 11:
    case 12:
      this.imageY = 64;
      break;
    case 13:
    case 14:
    case 15:
      this.imageY = 96;
      break;
    case 18:
    case 19:
      this.imageY = 128;
      break;
  }

  switch (this.num)
  {
    case 1:
    case 5:
    case 9:
    case 13:
      this.imageX = 0;
      break;
    case 2:
    case 6:
    case 10:
    case 14:
    case 18:
      this.imageX = 32;
      break;
    case 3:
    case 7:
    case 11:
    case 15:
    case 19:
      this.imageX = 64;
      break;
    case 4:
    case 8:
    case 12:
      this.imageX = 96;
      break;
  }
}

},{}]},{},[1]);
