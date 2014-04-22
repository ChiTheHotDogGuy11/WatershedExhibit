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

function initGameScreen(){
	// init play / pause button
	var play = function(playSpeed){
		gameState.playSpeed = playSpeed;
		gameState.playing = true;
		$('#play-btn')[0].src = 'images/pause-button.png';
	}
	var pause = function(){
		gameState.playing = false;
		$('#play-btn')[0].src = 'images/play-button.png';
	}

	$('#budgetMeter').show();
	$('#houseAnimContainer').show();
	$('#play-btn').click(function(){
		if(gameState.playing) pause();
		else play(1);
	});
	$('#next-btn').click(function(){
		play(2);
	});
	
	// init stacked chart
	var data = [];
	var data2 = [];
	var data3 = [];
	var data4 = [];
	var stackedChart = new StackedChart('gameChart')
		.setRange('line', 0, 5000)
		.setRange('bar', 0, 5000)
		.bind(true, function(){return Engine.out_variables['electricity_bill'].get_values()}, 'Electricity bill')
		.bind(false, function(){return Engine.out_variables['water_bill'].get_values()}, 'Water bill')
		.bind(true, function(){return Engine.out_variables['water_run_off'].get_values()}, 'Water run-off');
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
  	budget.change(MAX_BUDGET/1.1);
}


// function initGameScreen(){
// 	loadSvg('images/saving-icon.svg', 'saving-icon', function(){
// 	loadSvg('images/price-icon.svg', 'price-icon', function(){
// 	loadSvg('images/info-circle.svg', 'info-circle', function(){
// 	loadSvg('images/info-icon.svg', 'info-icon', function(){
// 		initPieces();
// 	});
// 	});
// 	});
// 	});
// 	loadSvg('images/house.svg', 'houseContainer', function(node){
// 		var groupId = 0;
// 		node.children('g').each(function(){
// 			visibilities[groupId] = -1;
// 			this.setAttribute('id', groupId+'g');
// 			groupId++;
// 		});
// 		visibilities[2] = 0;
// 		initTwo();
// 	});	
// 	$('#houseAnimContainer').hide();
// 	$('#submitButton').click(function(){
// 		if(availableBudget < 0){
// 			alert('You have exceeded your budget! Try removing some features!');
// 		}
// 		else{
// 		  $('#endScreen').show(function() {

// 		      var data = new google.visualization.DataTable(); 
		      
// 		      data.addColumn('string', 'Year');
// 		      data.addColumn('number', 'Initial Investment');
// 		      data.addColumn('number', 'Net Savings');

// 		      for(var tmp = 2014; tmp < 2030; tmp++)
// 		      {
// 		        //TODO update this with the actual year graph
// 		        data.addRow([tmp.toString(),initialInvestment,(tmp-2014)*yearSavings]);
// 		      }

// 		      var options = {
// 		        title: 'Savings Over Time'
// 		      };

// 		      var chart = new google.visualization.LineChart(document.getElementById('end_chart'));
// 		      chart.draw(data,options);
// 		  });
// 		}
// 	});
// }

function initElements(){
	$('#startButton').click(function(){
		$('#startScreen').hide();	
		$('#instrScreen').show();
	});

	$('#instrNextButton').click(function(){
		$('#instrScreen').hide();
		$('#instrScreen2').show();
	});

	$('#instrNextButton2').click(function(){
		$('#instrScreen2').hide();
		$('#instrScreen3').show();
	})

	$('#instrNextButton3').click(function(){
		$('#instrScreen3').hide();
		$('#qtnScreen1').show();
	})
	var qtnButton1Next = function(){
		$('#qtnScreen1').hide();
		$('#qtnScreen2').show();
	};
	$('#qtnButton11').click(qtnButton1Next);
	$('#qtnButton12').click(qtnButton1Next);
	$('#qtnButton13').click(qtnButton1Next);
	var qtnButton2Next = function(){
		$('#qtnScreen2').hide();
		$('#backgroundOverlay').hide();
		showGameScreen();
	};
	$('#qtnButton21').click(qtnButton2Next);
	$('#qtnButton22').click(qtnButton2Next);

	$('#backgroundOverlay').show();
	$('#startScreen').show();
	$('#budgetMeter').hide();
	$('#instrScreen').hide();
	$('#instrScreen2').hide();
	$('#instrScreen3').hide();
	$('#_endScreen').hide();
	$('#qtnScreen1').hide();
	$('#qtnScreen2').hide();
	$('#calibrate').click(function(){
		calibrate();
	});
}
// Emily's instruction initializing function
function initInstruction(){
	$('#instruction_screen2').hide();
	$('#instruction_screen3').hide();
	$('#instruction_screen4').hide();
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

    var onTimer = function(){
    	if(gameState.playing){
	 		Engine.simulate(1);
	 	}
	 	setTimeout(onTimer, 1000/gameState.playSpeed);
    }

	setTimeout(onTimer, 1000/gameState.playSpeed);
});
