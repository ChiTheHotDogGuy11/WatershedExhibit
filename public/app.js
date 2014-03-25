  'use strict';

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

	onUpdate : function(data) {
		console.log(data);
	},
};

//IO.init();
var boundingMap = {}; 

function BoundingBox(ref)
{
  this.ref = ref;
  this.x = function() {
    return $(ref).position().left;
  }
  this.y = function() {
    return $(ref).position().top
  }
  this.height = function() {
    return $(ref).height();
  }
  this.width = function() {
    return $(ref).width();
  }
}

function Piece(id)
{
  this.id = id;
  this.x = 0;
  this.y = 0;
  this.r = 30;
  this.ref = $(".page_container").append($('<div/>', {
    id: id,
    class: 'piece',
    css: {
      top: this.y - this.r,
      left: this.x - this.r,
      width: this.r,
      height: this.r
    }
  })); 
  this.move = function(x,y) {
    this.x = x;
    this.y = y;
    this.ref.animate({
      left: this.x-this.r,
      top: this.y-this.r 
    }, 'fast');
  };
}

BoundingBox.prototype.collision = function(circle)
{
  var circleDistance_x = Math.abs(circle.x - this.x());
  var circleDistance_y = Math.abs(circle.y - this.y());

  if (circleDistance_x > (this.width()/2 + circle.r)) {return false;}
  if (circleDistance_y > (this.height()/2 + circle.r)) { return false;}

  if (circleDistance_x <= (this.width()/2)) { return true; }
  if (circleDistance_y <= (this.height()/2)) {return true; }

  var cornerDistance = Math.pow((circleDistance_x - this.width()/2),2) +
                    Math.pow((circleDistance_y - this.height()/2),2);
  
  return (cornerDistance <= Math.pow(circle.r,2));
}


function checkIntersection(object)
{
  for(var box in boundingMap){
    if(box.left)
    {
    }
  }
}
