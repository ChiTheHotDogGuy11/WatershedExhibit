var Test = {

	init: function() {
		var colors = ["blue", "orange", "red", "black"];
		//Initialize the pieces.
		for (var i = 0; i < numPieces; i++) {
			var curPiece = new Piece(i, colors[i]);
			pieces.push(curPiece);
		}
        var budget = new Budget(30000);
        if (CHECKOUT_METHOD === 0) {
            $("#checkout-button").click(function() {
                for (var i = 0; i < inCheckout.length; i++) {
                    var curId = inCheckout[i];
                    var isPurchased = (purchasedFeatures.indexOf(curId) !== -1);
                    if (!isPurchased) {
                        var curPiece = pieces[curId];
                        budget.subtractAmount(curPiece.cost);
                        purchasedFeatures.push(curId);
                    }
                }
            });
            var checkoutArea = new BoundingBox($("#checkout-area"), 
                //in action
                function(id) {
                    $("#checkout-button").prop('disabled', false);
                    if (inCheckout.indexOf(id) == -1) inCheckout.push(id);
                }, 
                //out action
                function(id) {
                    var index = inCheckout.indexOf(id);
                    if (index > -1) inCheckout.splice(index, 1);
                    if (inCheckout.length == 0) {
                        $("#checkout-button").prop('disabled', true);
                    }
                }
            );
            boundingList.push(checkoutArea);
        }
        //DON'T DO: IT WILL CRASH!
        else if (CHECKOUT_METHOD === 1) {
            $("#checkout-area").css('display', 'none');
            var house = new BoundingBox($("#houseAnimContainer"),
                function(id){
                    console.log("collision with house");
                    visibilities[id] = FADING_IN;
                },
                function(id){
                    visibilities[id] = FADING_OUT;
                }
            );
            boundingList.push(house);
        }
        
        //Simulate moving pieces around on touchscreen with mouse.
		$(".piece")
            .mousedown(function() {
                var pieceId = parseInt($(this).attr("id").charAt(0))
                var piece = pieces[pieceId];
                $(window).mousemove(function(e) {
                    piece.move(e.pageX, e.pageY);
                });
            })
            .mouseup(function() {
                $(window).unbind("mousemove");
            });
	}
}