"use strict";

module.exports = exports = Pipe;

function Pipe(imgX, imgY, number, X, Y)
{
  this.imageX = imgX;
  this.imageY = imgY;
  this.num = number;
  this.up = "none";
  this.down = "none";
  this.right = "none";
  this.left = "left";
  this.connected = null;
  this.filled = false;
  this.cell = null;
  this.x = X;
  this.y = Y;
  this.image = new Image();
  this.image.src = "assets/pipes.png";
}
