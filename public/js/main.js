// Insert JS here
$(document).ready(function(){
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

	// $('.info_panel').hide();
	// $('#rainbarrel').hide();
	// $('#geothermal').hide();
// Function to call once receive meter data from server
	var updateMeter = function(initial, remaining){
		var meterPercentage = remaining/initial*100 + "%";
		$(".meter_level").css("width", meterPercentage);
	}

	updateMeter(1000,20);

});