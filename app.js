var net = require('net');

var server = net.createServer(function (socket) {
  console.log("connection!");
  
  socket.on('data', function (data) {
        console.log(data.toString());
    });
});

server.listen(1337, '127.0.0.1');