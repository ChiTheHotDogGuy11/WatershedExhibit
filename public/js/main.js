function showGameScreen(){
// Function to call once receive meter data from server
	var updateMeter = function(initial, remaining){
		var meterPercentage = remaining/initial*100 + "%";
		$(".meter_level").css("width", meterPercentage);
	}

	updateMeter(1000,20);	
}

function initAnim(){
	loadSvg('images/info-circle.svg', 'info-circle', function(){});
	loadSvg('images/info-icon.svg', 'info-icon', function(){})
	loadSvg('images/house.svg', 'houseContainer', function(node){
		var groupId = 0;
		node.children('g').each(function(){
			visibilities[groupId] = -1;
			this.setAttribute('id', groupId+'g');
			groupId++;
		});
		visibilities[0] = 0;
		visibilities[1] = 0;
		visibilities[2] = 0;
		visibilities[3] = 0;
		initTwo();
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
		initAnim();
        if (IS_TESTING) Test.init();
        else initPieces();
        initBudget();
        initCheckout();
		showGameScreen();
	})

	$('#backgroundOverlay').show();
	$('#startScreen').show();
	$('#instrScreen').hide();
	$('#instrScreen2').hide();
	$('#instrScreen3').hide();
}

// Insert JS here
$(document).ready(function(){
	initElements();
	//showGameScreen();

});