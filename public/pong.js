// PONG

player1X = 64;
player1Y = 256;
player2X = CANVAS_WIDTH - 64;
player2Y = 256;

ballVelocityX = 0;
ballVelocityY = 0;
ballX = CANVAS_WIDTH / 2;
ballY = CANVAS_HEIGHT / 2;

BALL_SPEED = 3;

function loop()
{
  clear();
  drawRect(player1X, player1Y, 16, 128);
  drawRect(player2X, player2Y, 16, 128);
  drawCircle(ballX, ballY, 10);

  ballX += ballVelocityX * BALL_SPEED;
  ballY += ballVelocityY * BALL_SPEED;

  if(rectInRect([player1X, player1Y, 16, 128], [ballX - 10, ballY - 10, 20, 20]))
  {
    if((playerNum == 1 && upPressed) || (playerNum == 2 && otherUp))
      ballVelocityY = -1;
    else if((playerNum == 1 && downPressed) || (playerNum == 2 && otherDown))
      ballVelocityY = 1;
    else
      ballVelocityY = 0;
    ballVelocityX *= -1;
    if(playerNum == 1)
      syncPayload({player1Y:player1Y, ballX:ballX, ballVelocityY:ballVelocityY});
    if(playerNum == 2)
      syncPayload({player2Y:player2Y, ballX:ballX, ballVelocityY:ballVelocityY});
  }
  if(rectInRect([player2X, player2Y, 16, 128], [ballX - 10, ballY - 10, 20, 20]))
  {
    if((playerNum == 2 && upPressed) || (playerNum == 1 && otherUp))
      ballVelocityY = -1;
    else if((playerNum == 2 && downPressed) || (playerNum == 1 && otherDown))
      ballVelocityY = 1;
    else
      ballVelocityY = 0;
    ballVelocityX *= -1;
    if(playerNum == 1)
      syncPayload({player1Y:player1Y, ballX:ballX, ballVelocityY:ballVelocityY});
    if(playerNum == 2)
      syncPayload({player2Y:player2Y, ballX:ballX, ballVelocityY:ballVelocityY});
  }

  if(ballY < 0 | ballY > CANVAS_HEIGHT)
    ballVelocityY *= -1;
  if(ballX < 0)
  {
    score(2, 1);
    start();
    ballVelocityX = 1;
  }
  if(ballX > CANVAS_WIDTH)
  {
    score(1, 1);
    start();
  }
}

function rectInRect(rect1, rect2)
{
  return !(rect1[0] + rect1[2] < rect2[0] || rect1[0] > rect2[0] + rect2[2] ||
           rect1[1] + rect1[3] < rect2[1] || rect1[1] > rect2[1] + rect2[3])
}
function start()
{
  ballX = CANVAS_WIDTH / 2;
  ballY = CANVAS_HEIGHT / 2;

  ballVelocityX = -1;
  ballVelocityY = 0;
}

function sync(data)
{
  if(data.player1Y && Math.abs(player1Y - data.player1Y) > 32)
    player1Y = data.player1Y;
  if(data.player2Y && Math.abs(player2Y - data.player2Y) > 32)
    player2Y = data.player2Y;
  if(data.ballX && Math.abs(ballX - data.ballX) > 32)
    ballX = data.ballX;
  if(data.ballVelocityY)
    ballVelocityY = data.ballVelocityY;
}

function onUp() {
  if(playerNum == 1)
    player1Y-= 2;
  else
    player2Y-= 2;
}
function onDown() {
  if(playerNum == 1)
    player1Y+= 2;
  else
    player2Y+= 2;
}
function onOtherUp() {
  if(playerNum == 1)
    player2Y-= 2;
  else
    player1Y-= 2;
}
function onOtherDown() {
  if(playerNum == 1)
    player2Y+= 2;
  else
    player1Y+= 2;
}
