// function convertCoord(a, b, c, p, na, nb, nc){
// 	// get baricentric coordinate
// 	var va = new Two.Vector(a.x, a.y);
// 	var vb = new Two.Vector(b.x, b.y);
// 	var vc = new Two.Vector(c.x, c.y);
// 	var vp = new Two.Vector(p.x, p.y);
// 	var v0 = vb-va;
// 	var v1 = vc-va;
// 	var v2 = vp-va;
// 	float d00 = v0.dot(v0);
// 	float d01 = v0.dot(v1);
// 	float d11 = v1.dot(v1);
// 	float d20 = v2.dot(v0);
// 	float d21 = v2.dot(v1);
// 	float denom = d00*d11-d01*d01;
// 	var v = (d11*d20-d01*d21) / denom;
// 	var w = (d00*d21-d01*d20) / denom;
// 	u = 1.0f - v - w;
// 	var result = Two.Vector(na.x, na.y) * v + Two.Vector(nb.x, nb.y) * w + Two.Vecotr(nc.x, nc.y) * u;
// 	console.log(result.x + " " + result.y);
// }

function showGameScreen(){
	$('#budgetMeter').show();
// Function to call once receive meter data from server
	updateMeter();	
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
		$('#backgroundOverlay').hide();
		initGameScreen();
		showGameScreen();
	})

	$('#backgroundOverlay').show();
	$('#startScreen').show();
	$('#budgetMeter').hide();
	$('#instrScreen').hide();
	$('#instrScreen2').hide();
	$('#instrScreen3').hide();
	$('#_endScreen').hide();
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
	});
	$('#instruction_screen4_previous').click(function(){
		$('#instruction_screen3').show();
		$('#instruction_screen4').hide();
	});

}

// Insert JS here
$(document).ready(function(){
	//convertCoord({x: 0, y: 0}, {x: 100, y: 0}, {x: 0, y: 100},{x: 30, y: 30}, {x: 0, y: 0}, {x: 100, y: 0}, {x: 0, y: 100})
	// initBudget();
	initElements();

	// New instruction page function
	initInstruction();


});