/* PORT NUMBERS */
var cppPort = 1337;
var clientPort = process.env.OPENSHIFT_NODEJS_PORT || 8001;
var clientIp = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';


 // Import the Express module
var express = require('express');
// Import the 'path' module (packaged with Node.js)
var path = require('path');
//Have an HTTP Proxy for our cross server scripting
var request = require('request');

// Create a new instance of Express
var app = express();

// Import the appServer file.
var simulation = require('./appServer');
/***************
 * C++ SETUP ***
 ***************/
var net = require('net');

var server = net.createServer(function (socket) {
  console.log("connection!");
  
  socket.on('data', function (data) {
        var buffer = []; 
        console.log(data.toString());
        simulation.update(data.toString());
    });
});
// Start listening directly on tcp port
if(clientIp == '127.0.0.1') {
  server.listen(cppPort, '0.0.0.0');
} else {
  server.listen(15001, clientIp);
}


function apiProxy() {
  return function (req,res,next) {
    if (req.url.match(new RegExp('^\/api'))){
      //We have a param url that is the place we want to go to
      var go_to = "http://" + decodeURIComponent(req.query.url);
      console.log(go_to);
      if (req.method == 'POST') {
        req.pipe(request.post(go_to, {form: req.body})).pipe(res);
      } else {
        request(go_to).pipe(res);
      }
    } else {
      next();
    }
  }
  proxy.on('error', function (err,req,res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.'); 
    });
  }

/******************
 * Terminator SETUP ***
 ******************/

var terminator = function(sig){
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating sample app ...',
                   Date(Date.now()), sig);
       process.exit(1);
    }   
    console.log('%s: Node server stopped.', Date(Date.now()) );
};  


/** 
 *  Setup termination handlers (for exit and a list of signals).
 */
var setupTerminationHandlers = function(){
    //  Process on exit and signals.
    process.on('exit', function() { terminator(); }); 

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { terminator(element); }); 
    }); 
}; 

/******************
 * CLIENT SETUP ***
 ******************/


// Create a simple Express application
app.configure(function() {
    // Turn down the logging activity
    app.use(express.logger('dev'));

    app.use(apiProxy());
    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'public')));
	
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));

});

setupTerminationHandlers();
// Create a Node.js based http server on clientPort
var server = require('http').createServer(app).listen(clientPort,clientIp);
// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
io.set('log level',1);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    simulation.initSimulation(io, socket);
});
