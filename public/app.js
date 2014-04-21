var piece_container = '.page_container';

'use strict';

function initCheckout() {
    if (CHECKOUT_METHOD === 0) {
        $("#checkout-button").click(function() {
            for (var i = 0; i < inCheckout.length; i++) {
                var curId = inCheckout[i];
                var isPurchased = (purchasedFeatures.indexOf(curId) !== -1);
                if (!isPurchased) {
                    var curPiece = pieces[curId];
                    budget.subtractAmount(curPiece.cost);
                    purchasedFeatures.push(curId);
                }
            }
        });
        var checkoutArea = new BoundingBox($("#checkout-area"), 
            //in action
            function(id) {
                $("#checkout-button").prop('disabled', false);
                if (inCheckout.indexOf(id) == -1) inCheckout.push(id);
            }, 
            //out action
            function(id) {
                var index = inCheckout.indexOf(id);
                if (index > -1) inCheckout.splice(index, 1);
                if (inCheckout.length == 0) {
                    $("#checkout-button").prop('disabled', true);
                }
            }
        );
        boundingList.push(checkoutArea);
    }
    //DON'T DO: IT WILL CRASH!
    else if (CHECKOUT_METHOD === 1) {
        $("#checkout-area").css('display', 'none');
        var house = new BoundingBox($("#houseAnimContainer"),
            function(id){
                console.log("collision with house");
                visibilities[id] = FADING_IN;
            },
            function(id){
                console.log('exiting');
                visibilities[id] = FADING_OUT;
            }
        );
        boundingList.push(house);
    }
}

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
				xCoord = (xPercent) * windowW * xScale + xShift;
				yCoord = (yPercent) * windowH * yScale + yShift;
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
				pieces[i].setTag(xCoord, yCoord);
                //buffer.push(parseFloat(coords[0]));
                //buffer.push(parseFloat(coords[1]));
            }
        }
    },
};


var yShift = 0;//100;//.6452;
var xShift = 0;//136;//.8245;
var yScale = 1;// 0.881;//80;
var xScale = 1;//0.716;//80;

function calibrate()
{
  $('#calibration').show();
  $('#point1').show();

  var x1,y1,x2,y2,x3,y3;
  var top,bottom,left,right;

  yShift = 0;
  xShift = 0;
  yScale = 1;
  xScale = 1;

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
        $('#calibration').hide();

        x3 = pieces[0].x;
        y3 = pieces[0].y;
        yScale = (bottom - top)/(Math.abs(y1) + Math.abs(y3));
        xScale = (right - left)/(Math.abs(x1) + Math.abs(x2));
        yShift = y1;
        xShift = x1;
        counter = 0;
      }
    }
  });
  //Then go through, record the points

}

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
    return ref.offset().left;
  }
  this.y = function() {
    return ref.offset().top
  }
  this.height = function() {
    return ref.height();
  }
  this.width = function() {
    return ref.width();
  }
}

/*  ----- touch events object setup ----- */
var TouchEvent = {

  //List of ongoing touches
  ongoingTouches: new Array,
  //The threshold for determining if a tag matches a touch
  threshold: 40,
  init: function() {
    var el = document.getElementsByTagName("body")[0];
    el.addEventListener("touchstart", this.handleStart, false);
    el.addEventListener("touchend", this.handleEnd, false);
    el.addEventListener("touchcancel", this.handleEnd, false);
    el.addEventListener("touchleave", this.handleEnd, false);
    el.addEventListener("touchmove", this.handleMove, false);
  },
  handleStart: function(evt) {
    evt.preventDefault();

    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++){
      this.ongoingTouches.push(copyTouch(touches[i]));
      this.assignToPiece(touch)
      /* TODO recognize piece here otherwise do default */ 
    }
  },
  handleEnd: function(evt) {
    //We might want to remove this + the handleStart prevent default.
    //this would allow .click to still work
    //And probably work fine for our purposes??
    evt.preventDefault();

    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++)
    {
      var idx = ongoingTouchIndexById(touches[i].identifier);
      if (idx >= 0) { 
        var touch = this.ongoingTouches[idx];
        if(touch.piece != null) {
          //TODO the thing we do when we remove the piece from the screen??
          ongoingTouches.splice(idx,1);
        } else {
          //TODO actually make this a click event here?? (this would be a mouseup event)
        }
      }
    }
    
  },
  handleCancel: function(evt) {
    //We treat cancels (like moving into the browser UI) as a pickup/end event
    alert('Not supported');
  },
  handleMove: function(evt) {
    evt.preventDefault();

    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++)
    {
      var idx = ongoingTouchIndexById(touches[i].identifier);
      if (idx >= 0) { 
        var touch = this.ongoingTouches[idx];
        if(touch.piece == null) {
          this.assignToPiece(touch)
        } else {
          touch.piece.moveTo(touch.pageX, touch.pageY);
        }
      }
    }
  },
  ongoingTouchIndexById: function(idToFind) {
    for (var i=0; i < this.ongoingTouches.length; i++){
      var id = ongoingTouches[i].identifier;
      if (id == idToFind){
        return i;
      }
    }
    return -1;
  },
  copyTouch: function(touch){
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY, piece: null};
  },
  assignToPiece: function(touch){
    for(var i = 0; i < pieces.length; i++) {
      if(Math.abs(piece.tagX - touch.pageX) < this.threshold && Math.abs(piece.tagY - touch.pageY) < this.threshold)
      {
        touch.piece = piece;
        //TODO Some initialization of the piece
        return;
      }
    }
  }
}


/* ------ Piece constructor -------- */

function Piece(system)
{
  this.system = system;
  var name = system.name;
  
  //Coordinates and size of our piece
  this.x = 0;
  this.y = 0;
  this.r = 40;
  this.diam = 110;

  //The current bounding box
  this.curBox = null;

  //Create our div object for a new piece
  var bw = 15;
  this.ref = {};
  this.ref['anchor'] = makeCircle(name+'-circle', 'piece', this.x, this.y, this.r, '15px solid', PINK, '.page_container')
  this.ref['nametag'] = makeTag(name+'-nametag', featureNames[name], -15, 50, this.ref['anchor']);
  this.ref['outerCicle'] = makeCircle(name+'-outercircle', 'piece', this.r-bw, this.r-bw, this.r*2, '2px solid', PINK, this.ref['anchor']);
  this.ref['info-icon'] = makeIcon(name+'-infoicon', 'images/info-button.png', 96, 24, -130, this.ref['anchor']);
  this.ref['plus-icon'] = makeIcon(name+'-plusicon', 'images/plus-button.png', 96, 120, 45, this.ref['anchor']);
  this.ref['minus-icon'] = makeIcon(name+'-minusicon', 'images/minus-button.png', 96, -65, 45, this.ref['anchor']);
  this.ref['info-panel'] = makeTag(name+'-infoPanel', 'information information information', 0, 0, this.ref['anchor']);
  makeArc(this.r*2, -bw+this.r, -bw+this.r, bw, 15, this.ref['anchor']);

  // // create info panel
  // this.ref['infopanel'] = $('<div/>').attr('id', name+'-infopanel')
  //   .attr('class', 'info-panel')
  //   .css({
  //     top: this.x,
  //     left: this.y,
  //   })
  //   .hide();
  // this.ref['anchor'].append(this.ref['infopanel']);
  
}

function makeArc(r, x, y, borderWidth, angle, parent){
  var div = $('<div/>').css({
      backgroundColor: 'transparent',
      position: 'absolute',
      left: x,
      top: y,
      width: r,
      height: r,
      overflow: 'hidden',
      WebkitTransformOrigin: 'rotate(0deg)',
    });
  var innerDiv = $('<div/>').css({
      border: borderWidth + 'px solid',
      position: 'absolute',
      borderColor: PINK,
      width: 2*r,
      height: 2*r,
      top: -r,
      left: -r,
      borderRadius: '50%',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      display: 'inline-block',
  });
  innerDiv.append($('<div/>'));
  div.append(innerDiv);
  parent.append(div);
}

function makeIcon(id, src, size, x, y, parent){
  var icon = $('<img src="' + src + '" id=' + id + '/>').css({
    position: 'absolute',
    width: size,
    height: size,
    left: x-size/2,
    top: y,
  });
  parent.append(icon);
  return icon;
}

function makeTag(id, text, offx, offy, parent){
  var tag = $('<div id='+ id + '/>')
    .html('<span class="info-circle-tag">'+text+'</span>')
    .css({
      position: 'absolute',
      left: offx,
      top: offy,
    });
  parent.append(tag);
  return tag;
}

function makeCircle(id, classname, x, y, r, border, borderColor, parent){
  var circle = $('<div/>', {
    id: id, 
    class: classname,
    css: {
      top: x-r,
      left: y-r,
      width: r*2,
      height: r*2,
      backgroundColor: 'transparent',
      border: border,
      borderColor: PINK,
    }
  }).appendTo(parent); 
  return circle;
}

Piece.prototype.move = function(x,y) {
  //Update our coordinates
  this.x = x;
  this.y = y;
  // move info panel
  // this.infopanel.css('top', x)
  //   .css('left', y);

  //move info circle
  //this.animGroup.translation.set(x, y);

  //Move its circle along with the piece
  this.ref['anchor'].css({
    left: this.x-this.r,
    top: this.y-this.r 
  });

  //Search the boundingList for a matching containing box
  for(var i = 0; i < boundingList.length; i++)
  {
    if(boundingList[i].collision(this))
    {
      //Don't do anything if we stayed in the same box
      if (this.curBox != boundingList[i])
      {
        //If we left another box, then we need to perform it's out action
        if (this.curBox != null)
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
var initialInvestment = 40000;
var yearSavings = 2700; 

$(function() {
  // $('#preferences').show(function() {
  //   google.maps.event.trigger(map, 'resize');
  // })

  // $('#preferences form').submit(function (event) {
  //   event.preventDefault();
  // });
});
