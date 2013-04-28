var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 640;

var GRID_WIDTH = 10;
var GRID_HEIGHT = 10;
var GRID_SPACING = 64;

var canvas;
var context;
function initialize()
{
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}
function drawRect(x, y, width, height, color)
{
  context.fillStyle = color || "black";
  context.fillRect(x, y, width, height);
}
function drawCircle(x, y, radius, color)
{
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.closePath();
  context.fill();
  context.stroke();
}
function line(fromX, fromY, toX, toY)
{
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.closePath();
  context.stroke();
}
function drawGrid()
{
  context.strokeStyle = "black";
  context.beginPath();
  for(var i = 0; i < GRID_WIDTH; i++)
  {
    context.moveTo(i * GRID_SPACING, 0);
    context.lineTo(i * GRID_SPACING, CANVAS_HEIGHT);
  }
  for(var i = 0; i < GRID_HEIGHT; i++)
  {
    context.moveTo(0, i * GRID_SPACING);
    context.lineTo(CANVAS_WIDTH, i * GRID_SPACING);
  }
  context.closePath();
  context.stroke();
}
function clear()
{
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
