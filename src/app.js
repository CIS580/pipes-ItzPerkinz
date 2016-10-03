"use strict";

/* Classes */
const Game = require('./game');
const Pipe = require('./pipe');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var image = new Image();
image.src = 'assets/pipes.png';

var level = 1;
var timer = 3500;
var temp;
var randNum;
var upcomingPipes = new Array();
var pipes = new Array();
var eventX;
var eventY;
var rect;

// Initialize board
var board = new Array();
for (var i = 0; i<195; i++)
{
  var slot = { pipe: false, liquid: false };
  board[i] = slot;
}


// Initialize pipes
var pcounter = 1
var listofpipes = new Array();

var upLarge = [1,5,10,11,12,15,18,19];
var upSmall = [9,13];
var rightLarge = [1,4,6,8,10,14,18,19];
var rightSmall = [2,3];
var leftLarge = [1,2,7,8,11,14,15,19];
var leftSmall = [3,4];
var downLarge = [1,6,7,12,13,14,15,18];
var downSmall = [5,9];

for (var y1 = 0; y1 <= 4; y1++)
{
  for (var x1 = 0; x1 <= 3; x1++)
  {
    if (pcounter != 16 && pcounter != 17 && pcounter != 20)
    {
      var pipe = new Pipe(x1*32, y1*32, pcounter, 0, 0 );
      for (var n = 0; n <= 18; n++)
      {
        if (upLarge.includes(pipe.num)) {pipe.up = "large";}
        if (downLarge.includes(pipe.num)) {pipe.down = "large";}
        if (rightLarge.includes(pipe.num)) {pipe.right = "large";}
        if (leftLarge.includes(pipe.num)) {pipe.left = "large";}
        if (upSmall.includes(pipe.num)) {pipe.up = "small";}
        if (downSmall.includes(pipe.num)) {pipe.down = "small";}
        if (rightSmall.includes(pipe.num)) {pipe.right = "small";}
        if (leftSmall.includes(pipe.num)) {pipe.left = "small";}
      }
      listofpipes.push(pipe);
    }
    pcounter++;
  }
}

// Left click
canvas.onclick = function(event) {
  event.preventDefault();
  // From -- http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    rect = canvas.getBoundingClientRect();
    eventX = event.clientX - rect.left;
    eventY = event.clientY - rect.top;
  // Determine cell
  var cellX = Math.floor(eventX/64);
  var cellY = Math.floor(eventY/64);
  // TODO: Place or rotate pipe tile
  if (board[((cellX-1)+cellY*15)].pipe == false)
    {
      var temp1 = upcomingPipes[0];
      temp1.x = cellX; temp1.y = cellY;
      pipes.push(temp1);
      upcomingPipes.shift();
      board[((cellX-1)+cellY*15)].pipe = true;  }
}

// Right click
canvas.oncontextmenu = function(event)
{
  event.preventDefault();
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
  timer = timer + elapsedTime;
  if (timer >= 3500)
  {
    randNum = Math.floor(Math.random()*17);
    temp = clonePipe(listofpipes[randNum]);
    upcomingPipes.push(temp);
    if (upcomingPipes.length > 13) { upcomingPipes.shift(); }
    timer = 1;
  }

  // TODO: Advance the fluid
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

  // Draws the list of upcoming pipes
  for (var u = 0; u < upcomingPipes.length; u++)
  {
    var currentPipe = upcomingPipes[u];
    ctx.drawImage(currentPipe.image, currentPipe.imageX, currentPipe.imageY, 31, 31, 0, (upcomingPipes.length-u)*64-64, 64, 64);
    //console.log(currentPipe.num + " " + currentPipe.up + " " + currentPipe.down + " " + currentPipe.right + " " + currentPipe.left);
  }

  // Draws the list of pipes on the board
  for (var u2 = 0; u2 < pipes.length; u2++)
  {
    var currentPipe2 = pipes[u2];
    ctx.drawImage(currentPipe2.image, currentPipe2.imageX, currentPipe2.imageY, 31, 31, currentPipe2.x*64, currentPipe2.y*64, 64, 64);
  }
}

function clonePipe(pipe)
{
  var temp = new Pipe(pipe.imageX, pipe.imageY, pipe.num, pipe.x, pipe.y);
  return temp;
}
