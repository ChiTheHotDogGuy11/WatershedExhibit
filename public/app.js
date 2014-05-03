var piece_container = '.page_container';

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
		if (window.location.host == "app-ecotouch.rhcloud.com") {
      IO.socket = io.connect("ws://"+window.location.host+":8000/");
    } else {
      IO.socket = io.connect();
    }
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

      		xCoord = (xPercent) * windowW * xScale + xShift;
      		yCoord = (yPercent) * windowH * yScale + yShift;

          if(i in pieces){
            pieces[i].move(xCoord, yCoord);
            if(xCoord > 0 && yCoord > 0 && GameState.state() == GAMESTATE_PROMPT_PIECE){
              GameState.step();
            }
          }
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

function Piece(system, numFrames, unit)
{
  this.system = system;
  var name = system.name;
  
  //Coordinates and size of our piece
  this.x = 0;
  this.y = 0;
  this.r = 40;
  this.diam = 110;
  this.paused = true;
  this.curFrame = 1;
  this.unit = unit;

  //The current bounding box
  this.curBox = null;

  //Create our div object for a new piece
  var bw = 15;
  this.ref = {};
  var ref = this.ref, self = this;

  var getOuterR = function(sysScale){ return self.r * (1.5+sysScale/5);}
  ref['anchor'] = makeCircle(name+'-circle', 'piece', this.x, this.y, this.r, '15px solid', PINK, '.page_container')
  ref['outer-circle'] = makeCircle(name+'-outercircle', 'piece', this.r-bw, this.r-bw, getOuterR(this.system.scale), '2px solid', PINK, this.ref['anchor']);
  ref['info-icon'] = makeIcon(name+'-infoicon', 'images/info-button.png', 60, this.r-bw, this.r-bw-this.r*3, this.ref['anchor']);
  ref['plus-icon'] = makeIcon(name+'-plusicon', 'images/plus-button.png', 60, this.r-bw+this.r*0.866*3, this.r-bw+this.r*1.5, this.ref['anchor'])
    .click(function(){
      if(GameState.state() == GAMESTATE_PROMPT_ICON){
        GameState.step();
      }
      self.system.scaleUp(); 
      ref['outer-circle'].detach();
      ref['outer-circle'] = makeCircle(name+'-outercircle', 'piece', self.r-bw, self.r-bw, getOuterR(self.system.scale), '2px solid', PINK, ref['anchor']);
      ref['scaletag'].detach();
      var scaleText = self.unit == '' ? 'scale: one size' : ('scale:'+self.system.scale+' '+self.unit + (self.system.scale > 1 ? 's' : ''));
      ref['scaletag'] = makeTag(name+'-scaletag', scaleText, -15, 80, self.ref['anchor']);
    });
  ref['minus-icon'] = makeIcon(name+'-minusicon', 'images/minus-button.png', 60, this.r-bw-this.r*0.866*3, this.r-bw+this.r*1.5, this.ref['anchor'])
    .click(function(){
      if(GameState.state() == GAMESTATE_PROMPT_ICON){
        GameState.step();
      }
      self.system.scaleDown();  
      ref['outer-circle'].detach();
      ref['outer-circle'] = makeCircle(name+'-outercircle', 'piece', self.r-bw, self.r-bw, getOuterR(self.system.scale), '2px solid', PINK, ref['anchor']);
      ref['scaletag'].detach();
      var scaleText = self.unit == '' ? 'scale: one size' : ('scale:'+self.system.scale+' '+self.unit + (self.system.scale > 1 ? 's' : ''));
      ref['scaletag'] = makeTag(name+'-scaletag', scaleText, -15, 80, self.ref['anchor']);
    });
  ref['info-panel'] = makePanel(name+'-infoPanel', infoPanelTexts[name], -150+this.r-bw, this.r*3, this.ref['anchor']);
  ref['rating-panel'] = makePanel(name+'-rating-panel', $('.'+this.system.name+'_rating').html(), 160+this.r-bw, this.r*3, this.ref['anchor'])
    .css('width', '150px');
  ref['info-icon'].click(function(){
    if(GameState.state() == GAMESTATE_PROMPT_ICON){
        GameState.step();
      }
    ref['info-panel'].toggle();
    ref['rating-panel'].toggle();
  });
  ref['nametag'] = makeTag(name+'-nametag', featureNames[name], -15, 50, this.ref['anchor']);
  var scaleText = this.unit == '' ? 'scale: one size' : ('scale: '+this.system.scale+' '+this.unit + (this.system.scale > 1 ? 's' : ''));
  ref['scaletag'] = makeTag(name+'-scaletag', scaleText, -15, 80, this.ref['anchor']);
  this.loadAnimation(name, 1, numFrames);
  
  setInterval(function(){
    if(!self.paused){
      $('#'+self.system.name+'_frame'+self.curFrame).hide();
      self.curFrame = self.curFrame >= self.endF ? 1 : self.curFrame+1;
      $('#'+self.system.name+'_frame'+self.curFrame).show();
    }
  }, 150);
}

Piece.prototype.play = function(){
  this.paused = false;
}

Piece.prototype.pause = function(){
  this.paused = true;
}

Piece.prototype.expand = function(){
  this.ref['minus-icon'].show();
  this.ref['plus-icon'].show();
  this.ref['info-icon'].show();
  this.ref['outer-circle'].show();
  for(var i = this.startF; i <= this.endF; i++){
    $('#'+this.system.name+'_frame'+i).hide();
  }
}

Piece.prototype.contract = function(){
  this.ref['info-panel'].hide();
  this.ref['minus-icon'].hide();
  this.ref['plus-icon'].hide();
  this.ref['info-icon'].hide();
  this.ref['outer-circle'].hide();
  $('#'+this.system.name+'_frame'+1).show();
}

Piece.prototype.loadAnimation = function(name, startF, endF){
  this.startF = startF;
  this.endF = endF;
  for(var i = startF; i <= endF; i++){
    var frame = $('<img/>', {
      src: 'images/animations/'+name+'/'+i+'.png',
      class: name+'_frame',
      id: name+'_frame'+i,
      }).css({
        zIndex: 1000,
      });
    $('#animAssets').append(frame);
  }
}

function makeIcon(id, src, size, x, y, parent){
  var icon = $('<img src="' + src + '" id=' + id + '/>').css({
    position: 'absolute',
    width: size,
    height: size,
    left: x-size/2,
    top: y-size/2,
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

function makePanel(id, text, offx, offy, parent){
  var panel = $('<div class="info-panel" id='+ id + '/>')
    .html(text)
    .css({
      position: 'absolute',
      left: offx,
      top: offy,
      display: 'none',
      zIndex: 200,
    });
  parent.append(panel);
  return panel;
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


/* --- the mysterious makeArc function. don't attempt to fix unless you have three free hours. --- */
// function makeArc(r, x, y, borderWidth, angle, parent){
//   var div = $('<div/>').css({
//       backgroundColor: 'transparent',
//       position: 'absolute',
//       left: x,
//       top: y,
//       width: r,
//       height: r,
//       overflow: 'hidden',
//       WebkitTransformOrigin: 'rotate(0deg)',
//     });
//   var innerDiv = $('<div/>').css({
//       border: borderWidth + 'px solid',
//       position: 'absolute',
//       borderColor: PINK,
//       width: 2*r,
//       height: 2*r,
//       top: -r,
//       left: -r,
//       borderRadius: '50%',
//       borderLeftColor: 'transparent',
//       borderRightColor: 'transparent',
//       display: 'inline-block',
//   });
//   innerDiv.append($('<div/>'));
//   div.append(innerDiv);
//   parent.append(div);
// }

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
    this.curBox.outAction(this);
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
  $('#preferences').show(function() {
    google.maps.event.trigger(map, 'resize');
    centerMap();
  });

  $('#preferences-form').submit(function (event) {
     event.preventDefault();
     Preferences.num_people = parseInt($('#preferences-form input[name=members]').val());
     $('#preferences').hide();
  });
});
