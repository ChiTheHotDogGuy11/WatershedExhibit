function showGameScreen(){
	$('#budgetMeter').show();
	$('#houseAnimContainer').show();
	visibilities[2] = 0;
// Function to call once receive meter data from server
	updateMeter();	
}


function initBudget(){
  // totalBudget = 35000;
  // availableBudget = 35000;
  // yearlySaving = 0;
  var budget = new Binding(document.getElementById('budgetValue'), 60, function(value){
    this.innerHTML = '$' + value + 'k/$60k';
  })
  budget.change(30);
}

function initBudgetTemp(){
	/*var img = new Image();
	$('<img></img>').load(function(){
		$('#househouse').prepend($(this));
		$(this).show();
	}).attr({
		src: 'images/houses/largeHouse.png',
	})*/
}


function initGameScreen(){
	loadSvg('images/saving-icon.svg', 'saving-icon', function(){
	loadSvg('images/price-icon.svg', 'price-icon', function(){
	loadSvg('images/info-circle.svg', 'info-circle', function(){
	loadSvg('images/info-icon.svg', 'info-icon', function(){
		initPieces();
	});
	});
	});
	});
	loadSvg('images/house.svg', 'houseContainer', function(node){
		var groupId = 0;
		node.children('g').each(function(){
			visibilities[groupId] = -1;
			this.setAttribute('id', groupId+'g');
			groupId++;
		});
		visibilities[2] = 0;
		initTwo();
	});	
	$('#houseAnimContainer').hide();
	$('#submitButton').click(function(){
		if(availableBudget < 0){
			alert('You have exceeded your budget! Try removing some features!');
		}
		else{
		  $('#endScreen').show(function() {

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
		  });
		}
	});
}

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

function _initElements(){
	$('#backgroundOverlay').hide();
	$('#startScreen').hide();
	$('#budgetMeter').hide();
	$('#instrScreen').hide();
	$('#instrScreen2').hide();
	$('#instrScreen3').hide();
	$('#_endScreen').hide();
	$('#qtnScreen1').hide();
	$('#qtnScreen2').hide();
	showGameScreen();
}

// Insert JS here
$(document).ready(function(){
	initBudgetTemp();
	//initBudget();
	//initGameScreen();
	//convertCoord({x: 0, y: 0}, {x: 100, y: 0}, {x: 0, y: 100},{x: 30, y: 30}, {x: 0, y: 0}, {x: 100, y: 0}, {x: 0, y: 100})
	_initElements();
	var data = [];
	var data2 = [];
	var data3 = [];
	var data4 = [];
	var stackedChart = new StackedChart('gameChart')
		.bind(true, function(){return data}, 'Electricity bill')
		.bind(false, function(){return data2}, 'Water bill')
		.bind(true, function(){return data4}, 'Water run-off');

	var water_params = {
        name: "water_consumption",
        on_update: function(newVal) {
        	if(this.name in Engine.out_variables){
        		data2.push(Engine.out_variables[this.name].current_value()/500);
        	}
        }, 
        init_value: 1000
    };
    Engine.new_out_variable(water_params);

    var barrel_params = {
        vars: ["rain"],
        calculation_function: function(in_vars, out_vars) {
          if(out_vars["water_consumption"] < 5000){
          	out_vars["water_consumption"] += 1000;
          	
          }
          else{
          	out_vars["water_consumption"] = 0;
          }
          return out_vars;
        },
        piece: undefined,
        name: "rain_barrels"
    };
    Engine.new_system(barrel_params);

	setInterval(function(){
	 	data.push(Math.random()*10);
	 	data3.push(Math.random()*10);
	 	data4.push(Math.random()*10);
	 	Engine.simulate(1);
	}, 1000);
});
