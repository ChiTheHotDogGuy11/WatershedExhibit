// Insert JS here
$(document).ready(function(){
	$(".info_panel").hide();
	$(".house").on("click", function(e){
		$(".info_panel").slideToggle();
	});
});