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
