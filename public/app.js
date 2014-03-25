function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}


'use strict';

//The number of pieces that exist on the board.
var numPieces = 4;
//Array to store the pieces.
var pieces;

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
		alert("Connected by client!");
		//The potential colors of the pieces.
		var colors = ["blue", "orange", "red", "black"];
		//Initialize the pieces.
		for (var i = 0; i < numPieces; i++) {
			var curPiece = new Piece(i, colors[i]);
			pieces.push(curPiece);
		}
	},


    onUpdate : function(data) {
		//Convert the byte arrays passed in the data
		//to floats
        data = data.message;
       // var buffer = [];
	    //Variables used to help move the pieces 
		var xPercent;
		var yPercent;
		var xCoord;
		var yCoord;
		var windowW = $(window).width();
		var windowH = $(window).height();
		//Structure of data is "x1,y1~x2,y2~..."
		var allCoords = data.toString().split('~');
        for(var i = 0; i < allCoords.length; i++){
            var coords = allCoords[i].split(',');
            if(coords.length >=2 ){
				//The floats passed are percentages of the screen
				xPercent = parseFloat(coords[0]);
				yPercent = parseFloat(coords[1]);
				//Scale the percentages to absolute values on screen
				xCoord = xPercent * windowW;
				yCoord = yPercent * windowH;
				pieceIndex = Math.floor(i/2);
				pieces[pieceIndex].move(xCoord, yCoord);
                //buffer.push(parseFloat(coords[0]));
                //buffer.push(parseFloat(coords[1]));
            }
        }

    },
};

function calibrate()
{
  $('.overlay').show();
  $('#point1').show();

  //Then go through, record the points
  $('#point1').hide();
  $('#point2').show();

  $('#point2').hide();
  $('#point3').show();
  
  $('#point3').hide();
}

var boundingList = []; 

function BoundingBox(ref, inAction, outAction)
{
  //Jquery reference for our bounding box
  this.ref = ref;

  //The action we should take when something enters our box
  this.inAction = inAction;
  
  //The action we should take when something leaves our box
  this.outAction = outAction;

  //Position reference helpers for our object
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

function Piece(id, color)
{
  //unique ID for our piece
  this.id = id;
  
  //Coordinates and size of our piece
  this.x = 0;
  this.y = 0;
  this.r = 30;
  
  //The current bounding box
  this.curBox = null;

  //Create our div object for a new piece
  this.ref = $('<div/>', {
    id: id,
    class: 'piece',
    css: {
      top: this.y - this.r,
      left: this.x - this.r,
      width: this.r*2,
      height: this.r*2,
	  background-color: color
    }
  }).appendTo('.page_container'); 
}

Piece.prototype.move = function(x,y) {
  //Update our coordinates
  this.x = x;
  this.y = y;
  
  //Move its circle along with the piece
  this.ref.animate({
    left: this.x-this.r,
    top: this.y-this.r 
  }, 'fast');

  //Search the boundingList for a matching containing box
  for(var i = 0; i < boundingList.length; i++)
  {
    if(boundingList[i].collision(this))
    {
      //Don't do anything if we stayed in the same box
      if (this.curBox != boundingList[i])
      {
        //If we left another box, then we need to perfom it's out action
        if (this.curBox == null)
        {
          this.curBox.outAction(this);
        }
        //Perfom the inaction for our new box
        boundingList[i].inAction(this);
        this.curBox = boundingList[i];
      }
      return;
    }
  }
  //We aren't in a box -- perform the outAction
  curBox.outAction(this);
  curBox = null;
} 

//Checks if a circular object aka a piece, crosses our bounding box
BoundingBox.prototype.collision = function(circle)
{
  var circleDistance_x = Math.abs(circle.x - this.x() - this.width()/2);
  var circleDistance_y = Math.abs(circle.y - this.y() - this.height()/2);

  if (circleDistance_x > (this.width()/2 + circle.r)) {return false;}
  if (circleDistance_y > (this.height()/2 + circle.r)) { return false;}

  if (circleDistance_x <= (this.width()/2)) { return true; }
  if (circleDistance_y <= (this.height()/2)) {return true; }

  var cornerDistance = Math.pow((circleDistance_x - this.width()/2),2) +
                    Math.pow((circleDistance_y - this.height()/2),2);
  
  return (cornerDistance <= Math.pow(circle.r,2));
}

//Create our socket connection to the server
IO.init();
