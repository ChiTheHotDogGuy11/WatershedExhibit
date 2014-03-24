<<<<<<< HEAD

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}

;
jQuery(function($){    
    'use strict';
=======
  'use strict';
>>>>>>> cde943b6a1c6cbed4ef9fb49415700c593370f42

/**
 * All the code relevant to Socket.IO is collected in the IO namespace.
 *
 * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
 */
var IO = {

	/**
	 * This is called when the page is displayed. It connects the Socket.IO client
	 * to the Socket.IO server
	 */
	init: function() {
		IO.socket = io.connect();
		IO.bindEvents();
	},

	/**
	 * While connected, Socket.IO will listen to the following events emitted
	 * by the Socket.IO server, then run the appropriate function.
	 */
	bindEvents : function() {
		IO.socket.on('connected', IO.onConnected );
		IO.socket.on('update', IO.onUpdate);
	},

	/**
	 * The client is successfully connected!
	 */
	onConnected : function(data) {
		// Cache a copy of the client's socket.IO session ID on the App
		//App.mySocketId = IO.socket.socket.sessionid;
		alert("Connected by client!");
	},

<<<<<<< HEAD
        onUpdate : function(data) {
            data = data.message;
            var buffer = [];
            var allCoords = data.toString().split('~');
            for(var i = 0; i < allCoords.length; i++){
                var coords = allCoords[i].split(',');
                if(coords.length >=2 ){
                    buffer.push(parseFloat(coords[0]));
                    buffer.push(parseFloat(coords[1]));
                }
            }
            console.log(data);
            if(buffer.length >=2 ){
                console.log(buffer[0] + " " + buffer[1]);
            }

        },
    };
=======
	onUpdate : function(data) {
		console.log(data);
	},
};
>>>>>>> cde943b6a1c6cbed4ef9fb49415700c593370f42

IO.init();
