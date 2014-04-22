var MAX_NUM_BARS = 12, // 6 bars per day. 7 days per week.
	BAR_WIDTH = function(contracted) {return contracted ? 12 : 40;},
	BAR_HEIGHT = 10,
	LINEGRAPH_HEIGHT = 70,
	LINEGRAPH_POINTSIZE = 5,
	labelXoff = 600,
	valueXoff = 100,
	yearXoff = 150,
	yearYoff = 40,
	colors = ['rgb(255, 255, 153)', 'rgb(104, 202, 202)', 'rgb(255, 102, 102)', 'rgb(153, 204, 102)', 'teal'],
	containerWidth; 

function StackedChart(_divId){
	this.contracted = false;
	var step = 500,
		data = [],
		tags = [],
		divId = _divId;	// collection of data getters singletons / sets.
	containerWidth = $('#'+divId).width();
	var self = this;
	this.lineRange = {min: 0, max: 1};
	this.barRange = {min: 0, max: 1};

	var update = function(){
		if(data.length > 0){
			render();
		}
		else{
			//console.log('no data to log');
		}
		setTimeout(update, step);
	}

	var render = function(){
		// initialize svg object
		$('#'+divId).empty();
		var svg = d3.select('#'+divId)
	            .append('svg')
	            .attr("width", containerWidth)
	            .attr("height", self.contracted? 70:90);

	    var h = 0;
	    for(var i = 0; i < data.length; i++){
	    	var datagroup = data[i];
	    	var group = svg.append('g')
	    		.attr('transform', 'translate(0,' + h + ')');
	    	var last;
	    	
	    	if( datagroup.length == 1 ){
	    		// bar chart
	    		self.drawBarChart(datagroup[0](), group, tags[i][0]);
	    		h += BAR_HEIGHT;
	    	}
	    	else{
	    		for(var j = 0; j < datagroup.length; j++){
	    			var _group = group.append('g');
	    			self.drawLineChart(datagroup[j](), _group, colors[j], tags[i][j], j * BAR_HEIGHT * 2 + 20);
	    		}
	    		h += LINEGRAPH_HEIGHT;
	    	}
	    	
	    }
	    if(!self.contracted){
	    	self.drawAxis(svg, h, []);	
		}
	}

	this.bind = function(isNewChart, _data, tag){
		if(!isNewChart && data.length > 0){
			data[data.length-1].push(_data);
			tags[tags.length-1].push(tag);
		}
		else{
			data.push([_data]);
			tags.push([tag]);
		}
		return this;
	}

	this.rebind = function(_data, tag){
		for(var i = 0; i < tags.length; i++){
			for(var j = 0; j < tags[i].length; j++){
				if(tags[i][j] == tag){
					data[i][j] = _data;
				}
			}
		}
	}

	this.step = function(_){
		step = _;
	}


	this.reposition = function(newDivId, year){
		$('#'+newDivId).show();
		//$('#'+newDivId).html($('#'+divId).html());
		$('#'+divId).empty();
		divId = newDivId;
		self.contracted = true;
		self.year = year;

	}

	render();
    // intialize timer
	setTimeout(update, step);
	return this;
}

StackedChart.prototype.setRange = function(type, min, max){
	if(type == 'line'){
		this.lineRange = {min: min, max: max};
	}
	if(type == 'bar'){
		this.barRange = {min: min, max: max};
	}
	return this;
}

StackedChart.prototype.drawAxis = function(svg, h, tickValues){
	//draw axis
    var xScale = d3.scale.linear()
		.domain([0, 7])
		.range([0, (MAX_NUM_BARS+2) * BAR_WIDTH(this.contracted)]);

	svg.append('g')
		.attr('class', 'stacked-chart-axis')
		.attr('transform', 'translate(0,' + h + ')')
    	.call(d3.svg.axis()
    	.scale(xScale)
    	.orient('bottom')
    	.tickValues([]));
}

StackedChart.prototype.drawBarChart = function(data, group, tag){
	var _data = [], 
		self = this;
	// make a copy of the data source array. not sure why splice does not work properly.
	for(var k = Math.max(0, data.length-MAX_NUM_BARS); k < data.length; k++){
		_data.push(data[k]);
	}
	group.selectAll('rect')
		.data(_data)
		.enter()
		.append('rect')
		.attr('x', function(d, _i){return _i * (BAR_WIDTH(self.contracted)+1);})
		.attr('y', 0)
		.attr('fill', function(d) {
			var perc = (d-self.barRange.min) / (self.barRange.max - self.barRange.min);
			var r = Math.round(255 * perc + 102 * (1-perc));
			var g = Math.round(102 * perc + 204 * (1-perc));
			var b = Math.round(102 * perc + (1-perc) * 204);
			return 'rgb('+r +','+g+',' + b + ')';
		})
		.attr('width', BAR_WIDTH(self.contracted))
		.attr('height', BAR_HEIGHT);

	// label
	if(!this.contracted){
		group.append('text')
		.text(tag)
		.attr('x', labelXoff)
		.attr('y', BAR_HEIGHT/2+5)
		.attr('fill','white')
		.attr('font-size', '14px');
		// cur data
		group.append('text')
		.text(_data.length > 0 ? Math.floor(_data[_data.length-1]*100)/100 : '--')
		.attr('x', valueXoff + labelXoff)
		.attr('y', BAR_HEIGHT/2+5)
		.attr('fill','white')
		.attr('font-size', '14px');
	}
}

StackedChart.prototype.drawLineChart = function(data, group, color, tag, height){
	var _data = [], 
		self = this;
	// make a copy of the data source array. not sure why splice does not work properly.
	for(var k = Math.max(0, data.length-MAX_NUM_BARS); k < data.length; k++){
		_data.push(data[k]);
	}
	var _g = group.selectAll('circle')
		.data(_data).enter().append('g');

	var mapHeight = function(d){
		return ((1-(d-self.lineRange.min)/ (self.lineRange.max - self.lineRange.min)) * 0.8 + 0.1) * LINEGRAPH_HEIGHT;
	}

	// the data point
	_g.append('circle')
		.attr('r', 3)
		.attr('cx', function(d, _i){return _i * (BAR_WIDTH(self.contracted)+1);})
		.attr('cy', mapHeight)
		.attr('fill', color)
		.attr('width', LINEGRAPH_POINTSIZE)
		.attr('height', LINEGRAPH_POINTSIZE);
	// line between points
	_g.append('line')
		.attr('x1', function(d, _i){return _i * (BAR_WIDTH(self.contracted)+1);})
		.attr('y1', mapHeight)
		.attr('x2', function(d, _i){return _i > 0 ? (_i-1) * (BAR_WIDTH(self.contracted)+1) : _i * (BAR_WIDTH(self.contracted)+1);})
		.attr('y2', function(d, _i){return _i > 0 ? mapHeight(_data[_i-1]) : mapHeight(d);})
		.attr('stroke', color)
		.attr('stroke-width', 1);
	// draw lable of the chart & cur data
	if(!this.contracted){
		group.append('text')
			.text(tag)
			.attr('x', labelXoff)
			.attr('y', height)
			.attr('fill', color)
			.attr('font-size', '14px');
		// draw text for cur data
		group.append('text')
			.text(_data.length > 0 ? Math.floor(_data[_data.length-1]*100)/100 : '--')
			.attr('x', valueXoff + labelXoff)
			.attr('y', height)
			.attr('fill', color)
			.attr('font-size', '14px');			
	}
	else{
			group.append('text')
			.text('year' + self.year)
			.attr('x', yearXoff)
			.attr('y', yearYoff)
			.attr('fill','white')
			.attr('font-size', '22px');
		}
}