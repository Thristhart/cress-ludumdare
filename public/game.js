var turn = 1;

var p1tokens = [];
var p2tokens = [];
var hoverDraw = [];
var selected = null;
var gameDone = false;
function loop()
{
  if(gameDone)
    return;
  clear();
  if(hoverDraw.length > 0)
  {
    for(var i = 0; i < hoverDraw.length; i++)
    {
      drawRect(hoverDraw[i].x * GRID_SPACING, hoverDraw[i].y * GRID_SPACING, GRID_SPACING, GRID_SPACING, hoverDraw[i].color);
    }
  }

  if(lastMove)
    arrow(lastMove.from.x * GRID_SPACING, lastMove.from.y * GRID_SPACING, lastMove.to.x * GRID_SPACING, lastMove.to.y * GRID_SPACING);

  drawGrid();
  for(var i = 0; i < p1tokens.length; i++)
  {
    drawP1Token(p1tokens[i]);
  }
  for(var i = 0; i < p2tokens.length; i++)
  {
    drawP2Token(p2tokens[i]);
  }
}
function init()
{
  for(var i = 0; i < GRID_WIDTH; i++)
  {
    p1tokens.push({x:i, y:GRID_HEIGHT -1, tired:0, owner:1});
    p2tokens.push({x:i, y:0, tired:0, owner:2});
  }
}
function endTurn(move, data)
{
  socket.emit(move, data);
  selected = null;
}
function click()
{
  if(turn != playerNum)
    return;
  if(hovering && selected != hovering)
  {
    selected = hovering;
    doHover(selected);
    return;
  }
  if(selected)
  {
    var box = {x:Math.floor(mouseX / GRID_SPACING), y:Math.floor(mouseY / GRID_SPACING)};
    var target = getTokenAt(box.x, box.y);
    console.log(box, selected);
    if(box.x - selected.x == 2 && box.y == selected.y && !target) // jump right
      return endTurn("jump", {from:selected, to:box});
    if(box.x - selected.x == -2 && box.y == selected.y && !target) // jump left
      return endTurn("jump", {from:selected, to:box});
    if(playerNum == 1 && box.x == selected.x && box.y - selected.y == -2 && !target) // jump forward (black)
      return endTurn("jump", {from:selected, to:box});
    if(playerNum == 2 && box.x == selected.x && box.y - selected.y == 2 && !target) // jump forward (white)
      return endTurn("jump", {from:selected, to:box});
    if(playerNum == 1 && box.x == selected.x && box.y - selected.y == -1 && !target) // move forward (black)
      return endTurn("move", {from:selected, to:box});
    if(playerNum == 2 && box.x == selected.x && box.y - selected.y == 1 &&  !target) // move forward (white)
      return endTurn("move", {from:selected, to:box});
    if(playerNum == 1 && box.x - selected.x == 1 && box.y == selected.y && target && target.owner == 2) // kill right (black)
      return endTurn("kill", {from:selected, to:box});
    if(playerNum == 2 && box.x - selected.x == 1 && box.y == selected.y && target && target.owner == 1) // kill right (white)
      return endTurn("kill", {from:selected, to:box});
    if(playerNum == 1 && box.x - selected.x == -1 && box.y == selected.y && target && target.owner == 2) // kill left (black)
      return endTurn("kill", {from:selected, to:box});
    if(playerNum == 2 && box.x - selected.x == -1 && box.y == selected.y && target && target.owner == 1) // kill left (white)
      return endTurn("kill", {from:selected, to:box});
    if(playerNum == 1 && selected.y == 0 && box.y == selected.y) // black win
      return endTurn("win", playerNum);
    if(playerNum == 2 && selected.y == GRID_HEIGHT - 1 && box.y == selected.y) // white win
      return endTurn("win", playerNum);
  }
}
function nextTurn()
{
  if(turn == 1)
  {
    for(var i = 0; i < p1tokens.length; i++)
      if(p1tokens[i].tired)
        p1tokens[i].tired--;
  }
  else
  {
    for(var i = 0; i < p2tokens.length; i++)
      if(p2tokens[i].tired)
        p2tokens[i].tired--;
  }
  if(turn == 1) turn = 2;
  else turn = 1;
  var color = (turn == 1 ? "Black" : "White");
  var otherColor = (turn == 2 ? "Black" : "White");
  document.body.style.backgroundColor = color;
  chatoutput.style.backgroundColor = color;
  chatoutput.style.color = otherColor;
  chatinput.style.backgroundColor = color;
  chatinput.style.color = otherColor;
}
function print(message)
{
  if(chatoutput.innerText)
    chatoutput.innerText += message + "\n";
  else
    chatoutput.textContent += message + "\n";
  chatoutput.scrollTop = chatoutput.scrollHeight;
}
function arrow(toX, toY, fromX, fromY)
{
  line(toX + GRID_SPACING / 2, toY + GRID_SPACING / 2, fromX + GRID_SPACING / 2, fromY + GRID_SPACING / 2);
}
function doWin(data)
{
  turn = 3;
  gameDone = true;
  context.font = "40px serif";
  if(data == 1)
  {
    drawRect(200, 300, 320, 100, "black");
    context.fillStyle = "white";
    context.fillText("Black player wins", 220, 360);
  }
  else
  {
    drawRect(200, 300, 320, 100, "white");
    context.fillStyle = "black";
    context.fillText("White player wins", 220, 360);
  }
}
var lastMove = null;
function doJump(data)
{
  token = getTokenAt(data.from.x, data.from.y);
  token.x = data.to.x;
  token.y = data.to.y;
  nextTurn();
  token.tired = 2;
  lastMove = data;
}
function doMove(data)
{
  token = getTokenAt(data.from.x, data.from.y);
  token.x = data.to.x;
  token.y = data.to.y;
  nextTurn();
  lastMove = data;
}
function doKill(data)
{
  killer = getTokenAt(data.from.x, data.from.y);
  token = getTokenAt(data.to.x, data.to.y);
  if(token.owner == 1)
    p1tokens.splice(p1tokens.indexOf(token), 1);
  if(token.owner == 2)
    p2tokens.splice(p2tokens.indexOf(token), 1);
  console.log(killer);

  if(killer.owner == 2)
  {
    for(var y = GRID_HEIGHT - 1; y >= 0; y--)
      if(!getTokenAt(killer.x, y))
        killer.y = y;
  }
  else
  {
    for(var y = 0; y < GRID_HEIGHT; y++)
    {
      if(!getTokenAt(killer.x, y))
        killer.y = y;
    }
  }
  nextTurn();
  lastMove = data;
}
function getTokenAt(x, y)
{
  for(var i = 0; i < p1tokens.length; i++)
    if(p1tokens[i].x == x && p1tokens[i].y == y)
      return p1tokens[i];
  for(var i = 0; i < p2tokens.length; i++)
    if(p2tokens[i].x == x && p2tokens[i].y == y)
      return p2tokens[i];
  return null;
}
var mouseX, mouseY;
function mousemove(x, y) {
  mouseX = x;
  mouseY = y;
  hoverDraw.length = 0;
  hovering = null;
  if(turn != playerNum)
    return;
  for(var i = 0; i < p1tokens.length; i++)
  {
    if(!(p1tokens[i].x * GRID_SPACING > x || p1tokens[i].y * GRID_SPACING > y || p1tokens[i].x * GRID_SPACING + GRID_SPACING < x || p1tokens[i].y * GRID_SPACING + GRID_SPACING < y))
      if(playerNum == 1)
        mouseOver(p1tokens[i]);
  }
  for(var i = 0; i < p2tokens.length; i++)
  {
    if(!(p2tokens[i].x * GRID_SPACING > x || p2tokens[i].y * GRID_SPACING > y || p2tokens[i].x * GRID_SPACING + GRID_SPACING < x || p2tokens[i].y * GRID_SPACING + GRID_SPACING < y))
      if(playerNum == 2)
        mouseOver(p2tokens[i]);
  }
  if(selected && hoverDraw.length == 0)
    doHover(selected);
};

function mouseOver(token)
{
  if(token.tired)
    return;
  
  hovering = token;

  doHover(token);
}
var hovering = null;
function doHover(token)
{
  if(!getTokenAt(token.x-2, token.y)) hoverDraw.push({x:token.x-2, y:token.y, color: "lightblue"});
  if(!getTokenAt(token.x+2, token.y)) hoverDraw.push({x:token.x+2, y:token.y, color: "lightblue"});
  if(playerNum == 1)
  {
    if(!getTokenAt(token.x, token.y-2)) hoverDraw.push({x:token.x, y:token.y-2, color: "lightblue"});
    if(!getTokenAt(token.x, token.y-1)) hoverDraw.push({x:token.x, y:token.y-1, color: "deepskyblue"});
    var left = getTokenAt(token.x-1 , token.y);
    var right = getTokenAt(token.x+1 , token.y);
    if(left && left.owner == 2)
      hoverDraw.push({x:token.x-1, y:token.y, color: "pink"});
    if(right && right.owner == 2)
      hoverDraw.push({x:token.x+1, y:token.y, color: "pink"});
    if(token.y == 0)
      hoverDraw.push({x:token.x, y: token.y, color: "green"});
  }
  else
  {
    if(!getTokenAt(token.x, token.y + 2)) hoverDraw.push({x:token.x, y:token.y+2, color: "lightblue"});
    if(!getTokenAt(token.x, token.y + 1)) hoverDraw.push({x:token.x, y:token.y+1, color: "deepskyblue"});
    var left = getTokenAt(token.x-1 , token.y);
    var right = getTokenAt(token.x+1 , token.y);
    if(left && left.owner == 1)
      hoverDraw.push({x:token.x-1, y:token.y, color: "pink"});
    if(right && right.owner == 1)
      hoverDraw.push({x:token.x+1, y:token.y, color: "pink"});
    if(token.y == GRID_HEIGHT - 1)
      hoverDraw.push({x:token.x, y: token.y, color: "green"});
  }

}

function drawP1Token(token)
{
  drawCircle(token.x * GRID_SPACING + GRID_SPACING/2, token.y * GRID_SPACING + GRID_SPACING/2, GRID_SPACING/2 - 3, "black");
  context.strokeStyle = "white";
  if(token.tired)
    drawX(token.x, token.y, token.tired);
}
function drawP2Token(token)
{
  context.strokeStyle = "black";
  drawCircle(token.x * GRID_SPACING + GRID_SPACING/2, token.y * GRID_SPACING + GRID_SPACING/2, GRID_SPACING/2 - 3, "white");
  if(token.tired)
    drawX(token.x, token.y, token.tired);
}

function drawX(x, y, tired)
{
  line(x * GRID_SPACING + 3, y * GRID_SPACING + 3, x * GRID_SPACING + GRID_SPACING - 3, y * GRID_SPACING + GRID_SPACING - 3);
  if(tired == 2)
    line(x * GRID_SPACING + GRID_SPACING - 3, y * GRID_SPACING + 3, x * GRID_SPACING + 3, y * GRID_SPACING + GRID_SPACING - 3);
}
