function initGameEngine(){

	// init pieces
	var inAction = function(piece){
		budget.change(budget.data - piece.system.cost(piece.system.scale));
    	piece.system.toggle();
    	activePieces.push(piece);
    	//console.log(activePieces);
    	piece.contract();
	}
	var outAction = function(piece){
		budget.change(budget.data + piece.system.cost(piece.system.scale));
    	piece.system.toggle();
    	activePieces.splice(activePieces.indexOf(piece), 1);
    	//console.log(activePieces);
    	piece.expand();
	}
	for(var i = 0; i < 2; i++){
		var bbox = new BoundingBox($('#pieceContainer'+i), inAction, outAction);
		boundingList.push(bbox);
	}
    var geo_sys = {
        vars: ["geo-thermal"],
        calculation_function: function(in_vars, out_vars) {
          return out_vars;
        },
        name: 'geo_thermal',
        cost: 30,
    };
    var rb_piece = new Piece(Engine.systems['rain_barrel'], 14, 'barrel', 5);
    Engine.systems['rain_barrel'].piece = rb_piece;
    rb_piece.move(200, 200);
    var gt_piece = new Piece(Engine.systems['geo_thermal'], 21, '', 1);
    Engine.systems['geo_thermal'].piece = gt_piece;
    gt_piece.move(250, 400);
    var sp_piece = new Piece(Engine.systems['solar_panel'], 13, 'kwatt', 5);
    Engine.systems['solar_panel'].piece = sp_piece;
    sp_piece.move(885, 494);
    pieces[1] = sp_piece;
    pieces[0] = gt_piece;
    pieces[2] = rb_piece;

    // secret functionalities of help / quit button for the sake of testing. should be removed in release!s
	$('#help-btn').click(function(){
		window.open("instruction.html","_blank","resizable=yes, top=200, left=200, width=1000, height=600");
		//sp_piece.move(sp_piece.x+10, sp_piece.y);
	});
	$('#close-btn').click(function(){
		window.location.href = 'instruction.html';
		//sp_piece.move(sp_piece.x, sp_piece.y+10);
	});
	$('#titlePanel').click(function(){
		GameState.step();
	});
	$('#budgetMeterBar').click(function(){
		sp_piece.move(sp_piece.x+10, sp_piece.y);
	});
}

function bindChart(containerId,params){
	// init stacked chart
	var stackedChart = new StackedChart(containerId,params)
		.setRange('line', 0, 400)
		.setRange('bar', 0, 120000)
		.bind(true, function(){return Engine.out_variables['outdoor_water'].get_values()}, 'Outdoor Water Consumption')
		.bind(false, function(){return Engine.out_variables['indoor_water'].get_values()}, 'Indoor Water Consumption')
		.bind(false, function(){return Engine.out_variables['energy_consumption'].get_values()}, 'Energy Consumption');
	return stackedChart;
}

function rebindChart(){
	var ebid = Engine.out_variables['outdoor_water'].save(), 
		wbid = Engine.out_variables['indoor_water'].save(),
		wrid = Engine.out_variables['energy_consumption'].save();

  //Save the scores for our systems	
  for(var key in Engine.systems) {
    if(Engine.systems.hasOwnProperty(key)) { 
      Engine.systems[key].save_score();
    }   
  }     

  var oldChart = stackedCharts[stackedCharts.length-1];
	oldChart.rebind(function(){return Engine.out_variables['outdoor_water'].get_past_values(ebid);}, 'Outdoor Water Consumption');
	oldChart.rebind(function(){return Engine.out_variables['indoor_water'].get_past_values(wbid);}, 'Indoor Water Consumption');
	oldChart.rebind(function(){
		return Engine.out_variables['energy_consumption'].get_past_values(wrid);}, 
	'Energy Consumption');
}

function initGameScreen(){
	// init play / pause button
	$('#budgetMeter').show();
	$('#houseAnimContainer').show();
	stackedCharts.push(bindChart('gameChart'));
}

function renderScreen(){
	if(GameState.level() == 0 && GameState.state() == GAMESTATE_PROMPT_PIECE){
		$('#prompt').text('Place pieces on the screen to explore different features.');
		$('#play-btn').css('box-shadow', '0 0 40px 0 #ff0000')
			.unbind('click')
			.click(function(){
				if(budget.data < 0){ 
					$('#prompt').text('You have exceeded your budget! Try changing some features.');
					return;
				}
				if(GameState.level() > 1){
					stackedCharts[stackedCharts.length-1].reposition('historyGraphContainer'+(GameState.level()-1), (GameState.level()-1));
					rebindChart();
				}				
				// activate system animations
				for(var i = 0; i < activePieces.length; i++){
					activePieces[i].play();
				}
				$('#prompt').text('simulating...');
				GameState.stepTo(1, GAMESTATE_PLAYING);
		});
	}
	else if(GameState.level() == 0 && GameState.state() == GAMESTATE_PROMPT_ICON){
		$('#prompt').text('Tap on the icons to learn more about this system.');
	}
	else if(GameState.level() == 0 && GameState.state() == GAMESTATE_PROMPT_SLOT){
		$('#pieceContainer0').css('box-shadow', '0 0 40px 0 #ff0000');
		$('#prompt').text('Drag a piece into a slot to install the feature.');
	}
	else if(GameState.level() <= NUM_LEVELS && GameState.state() == GAMESTATE_PAUSED){
		$('#play-btn').unbind('click').click(function(){
			if(GameState.level() > 1){
				stackedCharts[stackedCharts.length-1].reposition('historyGraphContainer'+(GameState.level()-1), (GameState.level()-1));
				rebindChart();
				stackedCharts.push(bindChart('gameChart'));
			}				
			// activate system animations
			for(var i = 0; i < activePieces.length; i++){
				activePieces[i].play();
			}
			GameState.step();
		})
		if(GameState.level() == 1){
			$('#prompt').text('Money spent! When you have chosen the systems for installation, hit the Play button.');
		}
		$('#pieceContainer0').css('box-shadow', '0 0 0px 0 #ff0000');
	}
	else if(GameState.level()  <= NUM_LEVELS && GameState.state() == GAMESTATE_PLAYING){
		$('#play-btn').css('box-shadow', '0 0 0px 0 #ff0000');
	}
	else if(GameState.level()  <= NUM_LEVELS && GameState.state() == GAMESTATE_DONE){	
    Engine.event_manager.terminate_events();
		$('#prompt').text('Round two has started. You may now make adjustments to your installation for this round.');
		//TODO put in the game state transition here
	    $('#roundScreen').parent().show(function() {
	      stackedCharts.push(bindChart('roundChart'));
        $('#scoreList').empty();
        var total = 0;
	      for(var key in Engine.systems) {
	        if(Engine.systems.hasOwnProperty(key) && Engine.systems[key].active) { 
	          var system = Engine.systems[key];
	          $('#scoreList').append('<dt>'+featureNames[system.name]+'</dt>');
	          $('#scoreList').append('<dd> Score: '+Math.round(system.score)+'</dd>');
	          $('#scoreList').append('<dd> Scale: '+system.scale+'</dd>');
	          total += Math.round(system.score);
          }
	      }
	      $('#roundScreen h2:first').html("Round " + (GameState.level()) + " Summary");
        $('#roundScore').html('Round Score: '+ total);
        $('#roundScreen button').unbind('click').click(function() {
	        $('#nextRound h2').html((GameState.level()+1) > NUM_LEVELS ? "Game over." : ("Round " + (GameState.level()+1)));
	        $('#roundScreen').fadeOut('fast', function() {
	          $('#nextRound').fadeIn('fast', function() {
	            stackedCharts.pop();
	            $('#roundChart').empty();
	            setTimeout(function() {
                $('#nextRound').hide();
                $('#roundScreen').show();
	              $('#roundScreen').parent().hide();
	            }, 1000);
	          })
	        });
	        GameState.step();
	      });
	    });

		// deactivate system animations
		for(var i = 0; i < activePieces.length; i++){
			activePieces[i].pause();
		}
	}		
	else{
		$('#prompt').text('Game over.');
		stackedCharts.push(bindChart('gameChart'));
		stackedCharts[stackedCharts.length-1].reposition('historyGraphContainer'+(GameState.level()-1), (GameState.level()-1));
		rebindChart();
		$('#endScreen').show(function() {
      for(var i = 1; i < GameState.level(); i++)
      {
        $('#endScreen').append($('#historyGraphContainer'+i).detach().css('margin', '60px'));
	      var total = 0;
        for(var key in Engine.systems) {
	        if(Engine.systems.hasOwnProperty(key) && Engine.systems[key].active) { 
	          var system = Engine.systems[key];
            //Our array is indexed at 0 instead of 1
            total += system.get_past_score(i-1);
	        }   
	      }
        $('#endScreen').append($('<div class="endScore">SCORE:'+Math.round(total)+'</div>'));
      }
    });
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
$(window).load(function(){
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
	 	setTimeout(onTimer, 1000);
    }

	setTimeout(onTimer, 1000);
});
