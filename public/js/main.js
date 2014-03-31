// Insert JS here
$(document).ready(function(){
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