var totalBudget;
var availableBudget;
var yearlySaving;

function initBudget(){
  totalBudget = 35000;
  availableBudget = 35000;
  yearlySaving = 0;
}

function updateMeter(){
    var meterPercentage = availableBudget/totalBudget*100 + "%";
    $(".meter_level").css("width", meterPercentage);
}

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}

'use strict';

//The number of pieces that exist on the board.
var numPieces = 3;
//Array to store the pieces.
var pieces = [];

var boundingList = []; 

function initPieces(){
    var colors = ["blue", "orange", "red", "black"];
    //Initialize the pieces.
    for (var i = 0; i < numPieces; i++) {
      var curPiece = new Piece(i, colors[i]);
      pieces.push(curPiece);
    }
    var house = new BoundingBox($("#screen"), function(id){
      var animId = animMapping[featureMapping[id]];
      visibilities[animId] = FADING_IN;
      availableBudget -= costs[id];
      yearlySaving += savings[id];
      updateMeter();
    }, function(id){
      var animId = animMapping[featureMapping[id]];
      visibilities[animId] = FADING_IN;
      availableBudget += cost[id];
      yearlySaving -= savings[id];
      updateMeter();
    });
    boundingList.push(house);
    pieces[0].move(300, 300);
    pieces[1].move(1000, 700);
    pieces[2].move(1200, 200);
}

function initBudget() {
    var budget = new Budget(30000);
}

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

function calibrate()
{
  $('#calibration').show();
  $('#point1').show();

  var x1,y1,x2,y2,x3,y3;
  var top,bottom,left,right;

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

/* ----- class Piece ------ */

/* ----- initialization helpers ------- */

function setTranslation(piece, angle, diam){
  var x = Math.cos(angle * Math.PI / 180) * diam;
  var y = Math.sin(angle * Math.PI / 180) * diam;
  piece.translation.set(x, y);
}

function setTranslationCSS(elem, angle, diam){
  elem.css('-webkit-transform', 'rotate(' + angle + 'deg) translate(' + diam + 'px, 0px)');
}

function makeIcon(domName, scale, angle){
  var icon = two.interpret(document.getElementById(domName)).center();
  icon.scale = scale;
  icon.angle = angle;
  return icon;
}

function makeTag(tagname, angle, text, parent){
  var tag = $('<div id='+ tagname + '/>')
    .html('<span class="info-circle-tag">'+text+'</span>');
  tag.angle = angle;
  parent.append(tag);
  return tag;
}

/* ------ constructor -------- */

function Piece(id, color)
{
  //unique ID for our piece
  this.id = id;
  
  //Set arbitrary cost for now
  this.cost = 10000;
  
  //Coordinates and size of our piece
  this.x = 0;
  this.y = 0;
  this.r = 30;
  this.diam = 110;
  
  //The current bounding box
  this.curBox = null;

  var backgroundColor = 'transparent';
  if (IS_TESTING) backgroundColor = color;
  //Create our div object for a new piece
  this.ref = {};
  this.ref['anchor'] = $('<div/>', {
    id: id+"circle",
    class: 'piece',
    css: {
      top: this.y - this.r,
      left: this.x - this.r,
      width: this.r*2,
      height: this.r*2,
	  backgroundColor: backgroundColor
    }
  }).appendTo('.page_container'); 

  // create tags that rotate around the info circles

  // name tag
  this.ref['nametag'] = makeTag(this.id+'nametag', 0, featureNames[this.id], this.ref['anchor']);
  this.ref['pricetag'] = makeTag(this.id+'pricetag', 30, 'Installation Cost: $'+costs[this.id], this.ref['anchor']);
  this.ref['savingtag'] = makeTag(this.id+'pricetag', 60, 'Saving: $' + savings[this.id]+'/yr', this.ref['anchor']);

  // create info panel
  this.ref['infopanel'] = $('<div/>').attr('id', id+'infopanel')
    .attr('class', 'info-panel')
    .css({
      top: this.x,
      left: this.y,
    })
    .hide();
  this.ref['anchor'].append(this.ref['infopanel']);

  //It seems like this always crashes if we don't have actual pieces.
  //this.initAnimation();
  
}


Piece.prototype.initAnimation = function(){
  // init info panel animation in two.js

  // info circle
  var circle = two.interpret(document.getElementById('info-circle')).center();
  circle.scale = 0.5;
  // info icon
  this.ref['infoicon'] = makeIcon('info-icon', 0.15, 0);
  this.ref['priceicon'] = makeIcon('price-icon', 0.12, 30);
  this.ref['savingicon'] = makeIcon('saving-icon', 0.15, 60);

  var angle = Math.random() * 360;
  var paused = false;
  var me = this;

  // Update the renderer in order to generate corresponding DOM Elements.
  two.update();
  $(this.ref['infoicon']._renderer.elem).click(function(){
    paused = !paused;
    paused ? me.ref['infopanel'].html(infoPanelTexts[me.id+'info']).show() : me.ref['infopanel'].hide();
  });
  $(this.ref['priceicon']._renderer.elem).click(function(){
    paused = !paused;
    paused ? me.ref['infopanel'].html(infoPanelTexts[me.id+'price']).show() : me.ref['infopanel'].hide();
  });
  $(this.ref['savingicon']._renderer.elem).click(function(){
    paused = !paused;
    paused ? me.ref['infopanel'].html(infoPanelTexts[me.id+'saving']).show() : me.ref['infopanel'].hide();
  });

  // bind update callback
  two.bind('update', function(){
    if(!paused){
      angle += 0.1;
      setTranslation(me.ref['infoicon'], me.ref['infoicon'].angle+angle, me.diam);
      setTranslation(me.ref['priceicon'], me.ref['priceicon'].angle+angle, me.diam);
      setTranslation(me.ref['savingicon'], me.ref['savingicon'].angle+angle, me.diam);
      setTranslationCSS(me.ref['nametag'], me.ref['nametag'].angle+angle, me.diam * 1.5);
      setTranslationCSS(me.ref['pricetag'], me.ref['pricetag'].angle+angle, me.diam * 1.5);
      setTranslationCSS(me.ref['savingtag'], me.ref['savingtag'].angle+angle, me.diam * 1.5);
    }
  });

  // save animation handle
  var group = two.makeGroup(circle, this.ref['infoicon'], this.ref['priceicon'], this.ref['savingicon']);
  this.animGroup = group;
}

Piece.prototype.move = function(x,y) {
  //Update our coordinates
  this.x = x;
  this.y = y;
  // move info panel
  // this.infopanel.css('top', x)
  //   .css('left', y);

  //move info circle
  this.animGroup.translation.set(x, y);

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
var initialInvestment = 40000;
var yearSavings = 2700; 

$(function() {
/*  $('#preferences').show(function() {
    google.maps.event.trigger(map, 'resize');
  })
*/
  $('#endScreen').show(function() {
    google.setOnLoadCallback(drawChart);
    function drawChart() {
      var data = new google.visualization.DataTable(); 
      
      data.addColumn('string', 'Year');
      data.addColumn('number', 'Initial Investment');
      data.addColumn('number', 'Net Savings');

      for(var tmp = 2014; tmp < 2030; tmp++)
      {
        //TODO update this with the actual year graph
        data.addRow([tmp.toString(),initialInvestment,(tmp-2014)*yearSavings]);
      }

      var options = {
        title: 'Savings Over Time'
      };

      var chart = new google.visualization.LineChart(document.getElementById('end_chart'));
      chart.draw(data,options);
    }
  });

});
