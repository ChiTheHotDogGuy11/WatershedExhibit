var Test = {

	init: function() {
		var colors = ["blue", "orange", "red", "black"];
		//Initialize the pieces.
		for (var i = 0; i < numPieces; i++) {
			var curPiece = new Piece(i, colors[i]);
			pieces.push(curPiece);
		}
		var house = new BoundingBox($(".house"), function(id){
			visibilities[id] = FADING_IN;
			console.log(id + " " + visibilities[id]);
			}, 
			function(id){
				visibilities[id] = FADING_OUT;
				console.log(id + " " + visibilities[id]);
		});
		boundingList.push(house);
	}
}