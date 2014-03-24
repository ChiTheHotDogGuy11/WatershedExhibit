/* PORT NUMBERS */
var cppPort = 1337;
var clientPort = 8080;


/***************
 * C++ SETUP ***
 ***************/
var net = require('net');

var server = net.createServer(function (socket) {
  console.log("connection!");
  
  socket.on('data', function (data) {
        console.log(data.toString());
    });
});
// Start listening directly on tcp port
server.listen(cppPort, '0.0.0.0');


/******************
 * CLIENT SETUP ***
 ******************/

 // Import the Express module
var express = require('express');
// Import the 'path' module (packaged with Node.js)
var path = require('path');

// Create a new instance of Express
var app = express();

// Import the appServer file.
var simulation = require('./appServer');

// Create a simple Express application
app.configure(function() {
    // Turn down the logging activity
    app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'public')));
	
	app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Create a Node.js based http server on clientPort
var server = require('http').createServer(app).listen(clientPort);

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
io.set('log level',1);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    simulation.initSimulation(io, socket);
});