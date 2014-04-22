function initGameEngine(){

	// init pieces
	var inAction = function(piece){
		budget.change(budget.data - piece.system.cost);
    	piece.system.active = true;
    	piece.contract();
	}
	var outAction = function(piece){
		budget.change(budget.data + piece.system.cost);
    	piece.system.active = false;
    	piece.expand();
	}
	for(var i = 0; i < 2; i++){
		var bbox = new BoundingBox($('#pieceContainer'+i), inAction, outAction);
		boundingList.push(bbox);
	}
    // pieces[1].move(-1000, -700);
    // pieces[2].move(-1200, -200);
    // pieces[3].move(-1000, -1000);


    Engine.new_out_variable({
        name: "water_bill",
        on_update: function(newVal) {}, 
        init_value: 1000,
    });
	
    Engine.new_out_variable({
        name: "electricity_bill",
        on_update: function(newVal) {}, 
        init_value: 1000,
    });

    Engine.new_out_variable({
    	name: 'water_run_off',
    	on_update: function(newVal) {}, 
    	init_value: 1000,
    });

    var barrel_sys = {
        vars: ["rain"],
        calculation_function: function(in_vars, out_vars) {
          if(out_vars["water_bill"] < 5000){
          	out_vars["water_bill"] += 1000;
          	
          }
          else{
          	out_vars["water_bill"] = 0;
          }
          out_vars['water_run_off'] = Math.random() * 5000;
          out_vars['electricity_bill'] = 1000;
          return out_vars;
        },
        name: 'rain_barrel',
        cost: 1,
    };
    barrel_sys.piece = new Piece(barrel_sys);
    barrel_sys.piece.move(400, 400);
    Engine.new_system(barrel_sys);

    // secret functionalities of help / quit button for the sake of testing. should be removed in release!s
	$('#help-btn').click(function(){
		barrel_sys.piece.move(barrel_sys.piece.x+10, barrel_sys.piece.y);
	});
	$('#close-btn').click(function(){
		console.log('here');
		barrel_sys.piece.move(barrel_sys.piece.x, barrel_sys.piece.y+10);
	});

}

function bindChart(containerId){
	// init stacked chart
	var stackedChart = new StackedChart(containerId)
		.setRange('line', 0, 5000)
		.setRange('bar', 0, 5000)
		.bind(true, function(){return Engine.out_variables['electricity_bill'].get_values()}, 'Electricity bill')
		.bind(false, function(){return Engine.out_variables['water_bill'].get_values()}, 'Water bill')
		.bind(true, function(){return Engine.out_variables['water_run_off'].get_values()}, 'Water run-off');
	return stackedChart;
}

function rebindChart(){
	var ebid = Engine.out_variables['electricity_bill'].save(), 
		wbid = Engine.out_variables['water_bill'].save(),
		wrid = Engine.out_variables['water_run_off'].save();
	var oldChart = stackedCharts[stackedCharts.length-1];
	oldChart.rebind(function(){return Engine.out_variables['electricity_bill'].get_past_values(ebid);}, 'Electricity bill');
	oldChart.rebind(function(){return Engine.out_variables['water_bill'].get_past_values(wbid);}, 'Water bill');
	oldChart.rebind(function(){return Engine.out_variables['water_run_off'].get_past_values(wrid);}, 'Water run_off');
}

function initGameScreen(){
	// init play / pause button
	$('#budgetMeter').show();
	$('#houseAnimContainer').show();
	stackedCharts.push(bindChart('gameChart'));
}

function renderScreen(){
	var contract = function(id){
		var btnId = '#y'+id+'-btn';
		$(btnId).removeClass().addClass('small-btn').css('box-shadow', '0 0 0px 0 #ff0000').attr('src', 'images/y'+id+'-button.png');
		return $(btnId);
	}

	var expand = function(id){
		var btnId = '#y'+id+'-btn';
		$(btnId).removeClass().addClass('big-btn').attr('src', 'images/y'+id+'-play-button.png');
		return $(btnId);
	}

	if(GameState.level() == 0){
		$('#pieceContainer0').css('box-shadow', '0 0 40px 0 #ff0000');
		$('#y1-btn').css('box-shadow', '0 0 0px 0 #ff0000')
		$('#y1-btn').unbind('click').
			click(function(){
				GameState.step(); 
			});
	}
	else if(GameState.level() <= NUM_LEVELS && GameState.state() == GAMESTATE_PAUSED){
		$('#pieceContainer0').css('box-shadow', '0 0 0px 0 #ff0000');
		expand(GameState.level()).css('box-shadow', '0 0 40px 0 #ff0000')
			.unbind('click')
			.click(function(){
				GameState.step();
			})
		for(var i = 1; i < NUM_LEVELS; i++){
			if(i != GameState.level()){
				contract(i);
			}
		}
	}
	else if(GameState.level()  <= NUM_LEVELS && GameState.state() == GAMESTATE_PLAYING){
		$('#y'+GameState.level()+'-btn').css('box-shadow', '0 0 0px 0 #ff0000');
	}
	else if(GameState.level()  <= NUM_LEVELS && GameState.state() == GAMESTATE_DONE){	
		contract('y'+GameState.level()+'-btn');
		$('#y'+GameState.level()+'-btn').unbind('click');
		stackedCharts[stackedCharts.length-1].reposition('historyGraphContainer'+GameState.level(), GameState.level());
		rebindChart();
		stackedCharts.push(bindChart('gameChart'));
		GameState.step();
	}		
	else{
		$('#endScreen').show();
		$('#endScreen').append($('#historyGraphContainer1').detach().css('margin', '60px'));
		$('#endScreen').append($('#historyGraphContainer2').detach().css('margin', '60px'));
		$('#endScreen').append($('#historyGraphContainer3').detach().css('margin', '60px'));
		$('#endScreen').append($('<div class="endScore">SCORE:1</div>'));
		$('#endScreen').append($('<div class="endScore">SCORE:2</div>'));
		$('#endScreen').append($('<div class="endScore">SCORE:3</div>'));
		$('#endScreen').append($('<div class="endText">Here are more words for the player.</div>'));
		$('#endScreen').append($('<input class="endInput" type="text" class="form-control" placeholder="Enter your email to receive more information about green practices!"></input>'));
		$('#endScreen').append($('<div class="endButton">SUBMIT!</div>'));
	}
}

function initBudget(){
	var img = new Image();
	$('<img></img>').load(function(){
		$('#househouse').prepend($(this));
		$(this).show();
	}).attr({
		id: 'mainHouse',
		src: 'images/houses/largeHouse.png',
	});
	budget = new Binding(document.getElementById('budgetValue'), 60, function(value){
    	this.innerHTML = '$' + Math.floor(value) + 'k/$' + MAX_BUDGET + 'k';
    	var totalHeight = $('#budgetMeterBg').height(), 
    		perc = value / MAX_BUDGET,
    		r = Math.round(255 * (1-perc) + 102 * perc),
    		g = Math.round(102 * (1-perc) + 204 * perc),
    		b = Math.round(102 * (1-perc) + 204 * perc);
		$('#budgetMeterBar').css('background-color', 'rgb(' + r + ',' + g + ',' + b + ')');    		
    	$('#budgetMeterBar').animate({
    		top: 15+(1-perc)*totalHeight,
    		height: perc*totalHeight,
    	});
    });
  	budget.change(MAX_BUDGET);
}


// Emily's instruction initializing function
function initInstruction(){
	$('#instruction_screen1').hide();
	$('#instruction_screen2').hide();
	$('#instruction_screen3').hide();
	$('#instruction_screen4').hide();
	$('#instruction_header').hide();
	$('#start_screen').show();
	$('#instruction_screen0_next').click(function(){
		$('#start_screen').hide();
		$('#instruction_screen1').show();
		$('#instruction_header').show();
	})
	$('#instruction_screen1_next').click(function(){
		$('#instruction_screen1').hide();
		$('#instruction_screen2').show();
	});
	$('#instruction_screen2_previous').click(function(){
		$('#instruction_screen1').show();
		$('#instruction_screen2').hide();
	});
	$('#instruction_screen2_next').click(function(){
		$('#instruction_screen3').show();
		$('#instruction_screen2').hide();
	});
	$('#instruction_screen3_previous').click(function(){
		$('#instruction_screen2').show();
		$('#instruction_screen3').hide();
	});
	$('#instruction_screen3_next').click(function(){
		$('#instruction_screen4').show();
		$('#instruction_screen3').hide();
		$('#instruction_header').hide();
	});
	$('#instruction_screen4_previous').click(function(){
		$('#instruction_screen3').show();
		$('#instruction_screen4').hide();
		$('#instruction_header').show();

	});

}


// Insert JS here
$(document).ready(function(){
	initInstruction();
	initBudget();
	initGameEngine();
	initGameScreen();
	renderScreen();

    var onTimer = function(){
    	if(GameState.state() == GAMESTATE_PLAYING){
	 		Engine.simulate(1);
	 		GameState.step();
	 	}
	 	setTimeout(onTimer, 100);
    }

	setTimeout(onTimer, 100);
});
