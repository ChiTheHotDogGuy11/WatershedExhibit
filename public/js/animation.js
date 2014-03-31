var FADING_IN = 0;
var FADING_OUT = 1;
var VISIBLE = 2;
var INVISIBLE = -1;

var visibilities = {};
var keys = {};
var children = {};
var animGroupId;

var two; //two.js object

function initTwo(){
	var params = {fullscreen: true};
	two = new Two(params).appendTo(document.getElementById("houseAnimContainer"));
	var shapes = [];
	$('#houseContainer').children('g').each(function(){
		var _shape = two.interpret(this);
		_shape.translation.set(520, 260);
		_shape.opacity = 0;
		_shape.scale = 1;
		shapes.push(_shape);
	});

	two.bind('update', function(frameCount) {
		for(var id in visibilities){
			var vis = visibilities[id];
			var animating = false;
			var shape = shapes[id];
			if(vis == FADING_IN){
				if(keys[id] == undefined){
					keys[id] = [];
					children[id] = undefined;
				}
				if(keys[id].length == 0){
					keys[id] = Object.keys(shape.children);
					children[id] = shape.children[keys[id][0]];
					shape.scale = 1;
					shape.opacity = 0;
				}
				animating = true;
			}
			else if(vis == FADING_OUT){
				shape.opacity = 0;
				visibilities[id] = INVISIBLE;
				keys[id] = [];
			}
			if(animating){
		    	if (keys[id].length > 0) {
		        	if (children[id].opacity > 0.999) {
		            	keys[id].shift();
		            	if(keys[id].length == 0){
		            		visibilities[id] = VISIBLE;
		            	}
		            	children[id] = shape.children[keys[id][0]];
		        	}
			        if (children[id]){
			        	children[id].opacity += 0.1;
			        }
			    }
			}
		}
	}).play();
}

function loadSvg(path, name, callback){
	$.get(path, null, function(data){
		var svgNode = $('svg', data);
		svgNode.attr('id', name)
			.css('display', 'none');
		$('#assets').append(svgNode);
		callback(svgNode);
	}, 'xml');
}