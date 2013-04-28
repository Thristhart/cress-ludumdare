var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')

app.listen(45006);

function handler (req, res) {
  parsedUrl = url.parse(req.url);
  var roomUUID;
  var path = '/index.html';
  var contentType = "text/html";

  if(parsedUrl.pathname.substr(0, 6) == '/room/')
  {
    parts = parsedUrl.pathname.split("/");
    if(parts.length == 3)
    {
      if(parts[2].length == 0) // they want a new room! looks like "/room/"
        return newRoom(req, res);
      else if(parts[2] == "p") // they want a new private room! looks like "/room/p"
        return newRoom(req, res, true);
      else // they're trying to get to a room and lost the / (looks like "/room/foo"
        return redirect(req, res, parsedUrl.pathname + "/");
    }
    if(parts.length == 4 && parts[3].length == 0) // if it looks like "/room/foo/"
    {
      roomUUID = parts[2];
      var r = root.rooms[roomUUID];
      if(r)
      {
        if(r.isClosed())
          path = "/gamefull.html";
        else
          path = "/game.html";
      }
      else
        return redirect(req, res, "/room/");
    }
  }
  else if(parsedUrl.pathname == "/")
    path = "/index.html";
  else if(parsedUrl.pathname == "/help")
    path = "/help.html";
  else
    path = "/public" + parsedUrl.pathname;
  fs.readFile(__dirname + path,
  function (err, data) {
    if(path.split(".")[1] == "js")
      contentType = "text/javascript";
    else if(path.split(".")[1] == "css")
      contentType = "text/css";
    else if(path.split(".")[1] == "png")
      contentType = "image/png";
    else if(path.split(".")[1] == "gif")
      contentType = "image/gif";
    res.setHeader("Content-Type", contentType);
    if (err) {
      res.writeHead(500);
      return res.end('Error loading requested page');
    }

    res.writeHead(200);
    res.end(data.toString().replace(/ROOM_UUID_GOES_HERE/g, roomUUID));
  });
}

function redirect(req, res, url)
{
  url = "/ld26" + url;
  res.statusCode = 302;
  res.setHeader("Location", url);
  res.end();
}

function generateID()
{
  return require('node-uuid').v4().split("-")[0];
}
this.rooms = {};
var root = this;
var Room = require('./room');
function newRoom(req, res, private)
{
  id = generateID();
  root.rooms[id] = new Room(root, id, private);
  if(!private)
    root.announceRoom(id);
  redirect(req, res, "/room/" + id + "/"); 
}

io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function(room) {
    if(!root.rooms[room])
      root.rooms[room] = new Room(root, room);
    root.rooms[room].addPlayer(socket);
  });
  var ids = keys(root.rooms);
  for(var i = 0; i < ids.length; i++)
  {
    if(!root.rooms[ids[i]].isPrivate())
      root.announceRoom(ids[i]);
  }
});

function keys(obj)
{
  var k = [];
  for(var key in obj)
  {
    if(obj.hasOwnProperty(key))
       k.push(key);
  }
  return k;
}

this.announceRoom = function(id)
{
  var r = root.rooms[id];
  if(r)
    io.sockets.emit("room", {roomId:id, players:r.getPlayerCount(), turn:r.getTurn()});
  else
    io.sockets.emit("deleteRoom", id);
}
