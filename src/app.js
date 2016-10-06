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
var timer = 0;
var temp;
var randNum;
var upcomingPipes = new Array();
var pipes = new Array();
var eventX;
var eventY;
var rect;
var start;
var end;
var connectedPipes = new Array();
var waterWay = new Array();
var watertimer = 57000;
var gameOver = false;
var flowing = false;

// Initialize board
var board = new Array();
for (var i = 0; i<195; i++)
{
  var slot = { pipe: null };
  board[i] = slot;
}


// Initialize pipes
var listofpipes = new Array();

var upLarge = [1,5,10,11,12,15,18,19];
var upSmall = [9,13];
var rightLarge = [1,4,6,8,10,14,18,19];
var rightSmall = [2,3];
var leftLarge = [1,2,7,8,11,14,15,19];
var leftSmall = [3,4];
var downLarge = [1,6,7,12,13,14,15,18];
var downSmall = [5,9];

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
        var temp1 = upcomingPipes[0];
        temp1.x = cellX; temp1.y = cellY;
        temp1.distanceFromRoot = 1000;
        pipes.push(temp1);
        upcomingPipes.shift();
        board[boardSlot].pipe = temp1;
        connect(temp1);
        //console.log(temp1);
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
      //console.log(newPipe);
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
    if (watertimer <= 0 && flowing == false) { flowing = true; console.log("Flowing at " + watertimer/1000 + " seconds");}
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
    //console.log(currentPipe.num + " " + currentPipe.up + " " + currentPipe.down + " " + currentPipe.right + " " + currentPipe.left);
  }

  // Draws the list of pipes on the board
  for (var u2 = 0; u2 < pipes.length; u2++)
  {
    var currentPipe2 = pipes[u2];
    if (currentPipe2.start) { ctx.fillStyle = "Green"; ctx.fillRect(currentPipe2.x*64+2, currentPipe2.y*64+2, 62, 62); }
    if (currentPipe2.end) { ctx.fillStyle = "Red"; ctx.fillRect(currentPipe2.x*64+2, currentPipe2.y*64+2, 62, 62);}
    ctx.drawImage(currentPipe2.image, currentPipe2.imageX, currentPipe2.imageY, 31, 31, currentPipe2.x*64, currentPipe2.y*64, 64, 64);
  }

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
// MIGHTVE FIXED THIS?
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
      //console.log("Connected up " + pipe.num + " to " + board[up].pipe.num + " " + pipe.connected.length + " " + board[up].pipe.connected.length);
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
      //console.log("Connected right " + pipe.num + " to " + board[right].pipe.num + " " + pipe.connected.length + " " + board[right].pipe.connected.length);

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
      //console.log("Connected left " + pipe.num + " to " + board[left].pipe.num + " " + pipe.connected.length + " " + board[left].pipe.connected.length);
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
      //console.log("Connected down " + pipe.num + " to " + board[down].pipe.num + " " + pipe.connected.length + " " + board[down].pipe.connected.length);
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
  console.log("----------   CP   -------------");
  for (var i = 0; i < connectedPipes.length; i++) { console.log(connectedPipes[i].num + " " + connectedPipes[i].distanceFromRoot);}
  console.log("-------------------------------");
}

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
  console.log("PRINTING WATERWAY -- count = " + waterWay.length);
  //console.log(cP[index]);
  for (var i2 = waterWay.length-1; i2 >= 0; i2--)
  {
    console.log("Num: " + waterWay[i2].num + " Distance: " + waterWay[i2].distanceFromRoot);
  }
  console.log("");
}

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
  //console.log("Cut " + pipe.num);
  if (connectedPipes.includes(pipe)) { removeElement(connectedPipes, pipe); }
  for (var i =0; i < pipe.connected.length; i++)
  {
    console.log("Removing " + pipe.num + " from " + pipe.connected[i].num + " which now has a connected list length of " + pipe.connected[i].connected.length);
    console.log(pipe.connected[i]);
    removeElement(pipe.connected[i].connected, pipe);
  }
  pipe.connected = new Array();
  //console.log("pipe connected has been cleared: " + pipe.connected.length);
  var root = findRoot(connectedPipes);
  //console.log("Root is: " + temp.num);
  connectedPipes = new Array();
  connectedPipes.push(root);
  //console.log("Expaning from: " + temp.num);
  //console.log(connectedPipes[0]);
  expandCP(root);
}

function expandCP(root)
{
  //console.log("Expanding CP -- Count = " + connectedPipes.length);
  //console.log(root);
  for (var i = 0; i < root.connected.length; i++)
  {
    if (connectedPipes.includes(root.connected[i]) != true)
    {
      //console.log("Adding - " + root.connected[i].num);
      root.connected[i].distanceFromRoot = root.distanceFromRoot + 1;
      connectedPipes.push(root.connected[i]);
      expandCP(root.connected[i]);
    }
  }
}

function fillNextPipe()
{
  console.log("Filling next pipe.")
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
    console.log("You Lose");
  }
}

// Checks to see if you have beaten the level!
function checkForWin()
{
  //console.log(end);
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
