var FADING_IN = 0;
var FADING_OUT = 1;
var VISIBLE = 2;
var INVISIBLE = -1;

// vis -1 = hide, 0 = fade in, 1 = fade out, 2 = fully visible
var visibilities = {};
var keys = {};
var children = {};
var animGroupId;

function initTwo(){
	var params = {width: 1000, height: 600};
	var two = new Two(params).appendTo(document.getElementById("houseAnimContainer"));
	var shapes = [];
	$('#houseContainer').children('g').each(function(){
		var _shape = two.interpret(this);
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

function initButtons(){
	$("#rbButtons").click(function(){
		visibilities[0] = FADING_IN;
	})
	$("#rbButtonh").click(function(){
		animating = false;
		visibilities[0] = FADING_OUT;
	});
	$("#gwButtons").click(function(){
		visibilities[1] = FADING_IN;
	})
	$("#gwButtonh").click(function(){
		animating = false;
		visibilities[1] = FADING_OUT;
	});
	$("#spButtons").click(function(){
		visibilities[3] = FADING_IN;
	})
	$("#spButtonh").click(function(){
		animating = false;
		visibilities[3] = FADING_OUT;
	});
}

$(document).ready(function(){
	$.get("images/house.svg", null, function(data){
		var svgNode = $("svg", data);
		var groupId = 0;
		$("#houseContainer").html($(svgNode).html())
			.css("display", "none")
			.children('g').each(function(){
				visibilities[groupId] = -1;
				this.setAttribute("id", groupId+"g");
				groupId++;
			});
		visibilities[2] = 0;
		visibilities[0] = 0;
		visibilities[1] = 0;
		visibilities[3] = 0;
		initTwo();
	}, 'xml');
});