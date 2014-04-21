var IS_TESTING = false;

/* To A/B test checking out, use
 *   0: checkout area,
 *   1: house is checkout area
 */
var CHECKOUT_METHOD = 0;
/* Used in: app.js */

//The number of pieces that exist on the board.
var numPieces = 4;

//Array to store the pieces.
var pieces = [];

//The bounding boxes we're concerned about.
var boundingList = []; 

var yScale = .64941;
var xScale = .77584;
var yShift;
var xShift;

//Store the id's of the pieces currently in
// checkout area
var inCheckout = [];

//The purchased features
var purchasedFeatures = [];

/* Used in: animation.js */
var FADING_IN = 0;
var FADING_OUT = 1;
var VISIBLE = 2;
var INVISIBLE = -1;

var visibilities = {};
var keys = {};
var children = {};
var animGroupId;

var two; //two.js object

var gameState = {
	playing: false,
	playSpeed: 1,
};


//The number of pieces that exist on the board.
var numPieces = 4;
//Array to store the pieces.
var pieces = {};

var budget;
var boundingList = []; 