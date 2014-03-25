// Insert JS here
$(document).ready(function(){
	$('.info_panel').hide();
	$('#rainbarrel').hide();

	$(".house").on("click", function(e){
		$('.info_panel').fadeToggle('toggle');
		$('#rainbarrel').toggle();

	});

});