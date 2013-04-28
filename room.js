function Room(parent, id, private)
{
  var parent = parent;
  var players = [];
  var id = id;
  var closed = false;
  var log = [];
  var turn = 0;


  this.getParent = function()
  {
    return parent;
  }
  this.getID = function()
  {
    return id;
  }
  this.getGame = function()
  {
    return game;
  }
  this.isClosed = function()
  {
    return closed;
  }
  this.isPrivate = function()
  {
    return private;
  }
  this.getPlayerCount = function()
  {
    return players.length;
  }
  this.getTurn = function()
  {
    return turn;
  }
  this.addPlayer = function(player)
  {
    if(closed) return;
    players.push(player);
    player.emit("pnum", players.length);
    for(var i = 0; i < log.length; i++)
    {
      player.emit(log[i][0], log[i][1]);
    }
    if(!private) parent.announceRoom(id);


    player.on('disconnect', function() {
      var index = players.indexOf(player);
      players.splice(index, 1);
      if(players.length > 0)
      {
        broadcast('player ' + (index + 1) + ' disconnected');
        players[0].emit("pnum", 1);
        p2ready = false;
      }
      else
      {
        delete parent.rooms[id];
      }
      closed = false;
      if(!private) parent.announceRoom(id);
    });
    player.on('msg', function(data) {
      var sender = "";
      var i = players.indexOf(player);
      if(i == 0)
        sender = "Black";
      else if(i == 1)
        sender = "White";
      else
        sender = "Spectator " + (i -1);
      broadcast('msg', sender + ": " + data);
    });
    player.on('jump', function(data) {
      broadcast('jump', data);
      turn++;
      if(!private) parent.announceRoom(id);
    });
    player.on('move', function(data) {
      broadcast('move', data);
      turn++;
      if(!private) parent.announceRoom(id);
    });
    player.on('kill', function(data) {
      broadcast('kill', data);
      turn++;
      if(!private) parent.announceRoom(id);
    });
    player.on('win', function(data) {
      broadcast('win', data);
    });

    player.on('doneLoad', function() {
      var index = players.indexOf(player);
      if(index == 0)
        p1ready = true;
      else
        p2ready = true;

      if(p1ready && p2ready)
      {
        broadcast("start");
        start();
      }
    });
  }
  function start()
  {
  }

  function emitNot(p, msg, data)
  {
    for(var i = 0; i < players.length; i++)
      if(players[i] != p) players[i].emit(msg, data);
  }

  function broadcast(message, data)
  {
    log.push([message, data]);
    for(var i = 0; i < players.length; i++)
      players[i].emit(message, data);
  }
}

module.exports = Room;
