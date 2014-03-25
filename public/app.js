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
var pieces = [];

var boundingList = []; 

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
		//alert("Connected by client!");
		//The potential colors of the pieces.
		var colors = ["blue", "orange", "red", "black"];
		//Initialize the pieces.
		for (var i = 0; i < numPieces; i++) {
			var curPiece = new Piece(i, colors[i]);
			pieces.push(curPiece);
		}
    var house = new BoundingBox($(".house"), function(id){
      visibilities[id] = FADING_IN;
      console.log(id + " " + visibilities[id]);
    }, function(id){
      visibilities[id] = FADING_OUT;
      console.log(id + " " + visibilities[id]);
    });
    boundingList.push(house);
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
        // if(xPercent < -10){
        //   continue;
        // }
				//Scale the percentages to absolute values on screen
        //var middle = windowW / 2;
        //var perfectY = windowH * .6;
				xCoord = xPercent * windowW * xScale + 200;
				yCoord = yPercent * windowH * yScale + 200;
    //     var distFromMidX = Math.abs(middle - xCoord);
    //     var distFromMidY = Math.abs(perfectY - yCoord);
    //     xCoord *= (.8 * distFromMidX);
    //     yCoord *= (.8 * distFromMidY);
				// //pieceIndex = Math.floor(i);
        //var curID = pieces[pieceIndex].id;
        //console.log(pieceIndex);
        //$("#" + curID + "circle").css("left", xCoord+"px");
        //$("#" + curID + "circle").css("top", yCoord+"px");
        //console.log(xCoord + " " + yCoord);
				pieces[i].move(xCoord, yCoord);
                //buffer.push(parseFloat(coords[0]));
                //buffer.push(parseFloat(coords[1]));
            }
        }
    },
};

var yScale = .64941;
var xScale = .77584;

function calibrate()
{
  $('.overlay').show();
  $('#point1').show();

  var x1;
  var y1;

  var x2;
  var y2;

  var x3;
  var y3;

  var top;
  var bottom;

  var left;
  var right;

  var counter = 0

  $(document).keypress(function(e) {
    if(e.which == 13) {
      if(counter == 0) {
        $('#point2').show();

        top = $('#point1').position().top;
        left = $('#point1').position().left;

        x1 = pieces[0].x;
        y1 = pieces[0].y;
        $('#point1').hide();
        counter++;
      }
      else if(counter == 1) {
        $('#point3').show();

        right = $('#point2').position().left;

        x2 = pieces[0].x;
        y2 = pieces[0].y;

        $('#point2').hide();
        counter++;
      }
      else if(counter == 2) {
        bottom = $('#point3').position().top;

        $('#point3').hide();
        $('.overlay').hide();

        x3 = pieces[0].x;
        y3 = pieces[0].y;
        yScale = (Math.abs(y1) + Math.abs(y3))/(bottom - top);
        xScale = (Math.abs(x1) + Math.abs(x2))/(right - left);
        counter = 0;
      }
    }
  });
  //Then go through, record the points

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
    id: id+"circle",
    class: 'piece',
    css: {
      top: this.y - this.r,
      left: this.x - this.r,
      width: this.r*2,
      height: this.r*2,
	   backgroundColor: 'transparent'
    }
  }).appendTo('.page_container'); 

}

Piece.prototype.move = function(x,y) {
  console.log(x + " " +y);
  //Update our coordinates
  this.x = x;
  this.y = y;

  //Move its circle along with the piece
  this.ref.css({
    left: this.x-this.r,
    top: this.y-this.r 
  });

  //this.ref.left = this.x - this.r;
  //this.ref.top = this.y - this.r;

  // for(var i = 0; i < boundingList.length; i++){
  //   var box = boundingList[i];
  //   console.log(this.x + " " + this.y + " " + box.x() + " " + box.y() + " " + box.width() + " " + box.height());
  //   if((this.x > box.x() && this.x < box.x() + box.width()) &&
  //     (this.y > box.y() && this.y < box.y() + box.height())){
  //   }
  //   else{
  //   }
  // }
  //Search the boundingList for a matching containing box
  for(var i = 0; i < boundingList.length; i++)
  {
    if(boundingList[i].collision(this))
    {
      //Don't do anything if we stayed in the same box
      if (this.curBox != boundingList[i])
      {
        //If we left another box, then we need to perfom it's out action
        if (this.curBox != null)
        {
          this.curBox.outAction(this.id);
        }
        //Perfom the inaction for our new box
        boundingList[i].inAction(this.id);
        this.curBox = boundingList[i];
      }
      return;
    }
  }
  //We aren't in a box -- perform the outAction
  if (this.curBox != null){
    this.curBox.outAction(this.id);
    this.curBox = null;
  }
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
