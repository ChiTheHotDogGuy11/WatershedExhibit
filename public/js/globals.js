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

var GameState = (function(){
	var _level = 0;
	var _state = GAMESTATE_PROMPT_PIECE;
	var _playCount = 0;
	var MAX_PLAYCOUNT = 12;
	function level(){
		return _level;
	}
	function state(){
		return _state;
	}
	function stepTo(level, state){
		_level = level;
		_state = state;
		_playCount = 0;
	}
	function step(){
		if(_level == 0){
			if(_state == GAMESTATE_PROMPT_PIECE){
				_state = GAMESTATE_PROMPT_ICON;
			}
			else if(_state == GAMESTATE_PROMPT_ICON){
				_state = GAMESTATE_PROMPT_SLOT;
			}
			else{
				_level++;
				_state = GAMESTATE_PAUSED;
			}
		}
		else if(_level <= NUM_LEVELS){
			if(_state == GAMESTATE_PAUSED){
				_state = GAMESTATE_PLAYING;
				_playCount = 0;
			}
			else if(_state == GAMESTATE_PLAYING){
				_playCount++;
				if(_playCount >= MAX_PLAYCOUNT)	_state = GAMESTATE_DONE;
			}
			else if(_state == GAMESTATE_DONE){
				_level++;
				_state = GAMESTATE_PAUSED
			}
		}
		renderScreen();
	}
	return {
		level: level,
		state: state,
		step: step,
		stepTo: stepTo,
	};
})(GameState|| {});

//The number of pieces that exist on the board.
var numPieces = 4;
//Array to store the pieces.
var activePieces = [];

var budget;
var boundingList = []; 

var stackedCharts = [];