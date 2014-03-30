// Insert JS here
$(document).ready(function(){
	// $('.info_panel').hide();
	$('#rainbarrel').hide();
	$('#geothermal').hide();

	$(".house").on("click", function(e){
		// $('.info_panel').fadeToggle('toggle');
		$('#rainbarrel').toggle();
		$('#geothermal').toggle();

	});

	var updateMeter = function(initial, remaining){
		var meterPercentage = remaining/initial*100 + "%";
		$(".meter_level").css("width", meterPercentage);
		console.log(meterPercentage);
	}

	updateMeter(1000,20);

});